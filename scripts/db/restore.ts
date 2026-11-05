import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { Pool } from "@neondatabase/serverless";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import readline from "node:readline";

const TABLE_RESTORE_ORDER = [
  "categories",
  "tags",
  "user",
  "account",
  "two_factor",
  "posts",
  "post_tags",
  "session",
  "account_lockouts",
  "rate_limits",
  "security_events",
  "audit_log",
];

const REQUIRED_CONFIRMATION_PHRASE = "CONFIRM RESTORE DEV DATABASE";

async function askConfirmation(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("==================================================");
  console.log(" GuruOm Dental - Database Restore Utility");
  console.log("==================================================");

  // 1. Strict Environment Safety Guard
  const restoreDevAllow = process.env.RESTORE_DEV_ALLOW?.trim();
  if (restoreDevAllow !== "true") {
    console.error("\n[REFUSED] RESTORE_DEV_ALLOW is not set to 'true'.");
    console.error("Restoring is strictly disabled by default to protect production databases.");
    console.error("Set RESTORE_DEV_ALLOW=true in your environment to enable restoration into a DEV database.");
    process.exit(1);
  }

  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("[FATAL ERROR] No DATABASE_URL or DATABASE_URL_UNPOOLED configured.");
    process.exit(1);
  }

  // Refuse obvious production indicators
  if (
    process.env.NODE_ENV === "production" ||
    connectionString.includes("production") ||
    connectionString.includes("prod")
  ) {
    console.error("\n[REFUSED] Restore target appears to be a production database.");
    console.error("Restoring directly into production databases is prohibited by policy.");
    process.exit(1);
  }

  // 2. Parse backup file argument
  const args = process.argv.slice(2);
  const skipPrompt = args.includes("--yes");
  const fileArg = args.find((a) => !a.startsWith("--"));

  if (!fileArg) {
    console.error("\n[USAGE] npm run db:restore -- <path/to/backup-file> [--yes]");
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`\n[FATAL ERROR] Backup file not found at: ${resolvedPath}`);
    process.exit(1);
  }

  // 3. User Confirmation Prompt
  if (!skipPrompt) {
    console.log(`\nTARGET DATABASE: Verified Dev / Non-Production Target`);
    console.log(`SOURCE BACKUP:   ${resolvedPath}`);
    console.log(`\nWARNING: Restoring will overwrite matching records in the DEV database!`);
    const answer = await askConfirmation(
      `Type "${REQUIRED_CONFIRMATION_PHRASE}" to proceed: `
    );

    if (answer !== REQUIRED_CONFIRMATION_PHRASE) {
      console.log("\n[ABORTED] Confirmation phrase did not match. No changes made.");
      process.exit(0);
    }
  }

  // 4. Decrypt & Decompress
  const rawBuffer = fs.readFileSync(resolvedPath);
  let decompressedJson: string;

  try {
    if (resolvedPath.endsWith(".enc") || rawBuffer.subarray(0, 4).toString("utf-8") === "GUBK") {
      const passphrase = process.env.BACKUP_PASSPHRASE?.trim();
      if (!passphrase) {
        console.error("\n[FATAL ERROR] This backup is encrypted with AES-256-GCM. Set BACKUP_PASSPHRASE to restore.");
        process.exit(1);
      }

      // Format: magic(4) + salt(16) + iv(12) + authTag(16) + ciphertext
      let offset = 0;
      if (rawBuffer.subarray(0, 4).toString("utf-8") === "GUBK") {
        offset = 4;
      }

      const salt = rawBuffer.subarray(offset, offset + 16);
      const iv = rawBuffer.subarray(offset + 16, offset + 28);
      const authTag = rawBuffer.subarray(offset + 28, offset + 44);
      const ciphertext = rawBuffer.subarray(offset + 44);

      const key = crypto.scryptSync(passphrase, salt, 32);
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      decompressedJson = zlib.gunzipSync(decrypted).toString("utf-8");
    } else {
      decompressedJson = zlib.gunzipSync(rawBuffer).toString("utf-8");
    }
  } catch (err) {
    console.error("\n[FATAL ERROR] Failed to decrypt or decompress backup archive:", (err as Error).message);
    process.exit(1);
  }

  const backupData = JSON.parse(decompressedJson);
  console.log(`\nBackup Metadata: Created at ${backupData.createdAt}, version ${backupData.version}`);

  const pool = new Pool({ connectionString });
  const restoredCounts: Record<string, number> = {};

  try {
    for (const table of TABLE_RESTORE_ORDER) {
      const rows = backupData.tables?.[table] as Record<string, unknown>[] | undefined;
      if (!rows || rows.length === 0) {
        restoredCounts[table] = 0;
        continue;
      }

      // Truncate table before reloading
      await pool.query(`DELETE FROM "${table}"`);

      // Insert rows
      for (const row of rows) {
        const keys = Object.keys(row);
        const values = Object.values(row);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
        const columns = keys.map((k) => `"${k}"`).join(", ");

        await pool.query(
          `INSERT INTO "${table}" (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
      }

      restoredCounts[table] = rows.length;
    }

    console.log("\nRestoration Summary:");
    console.table(
      Object.entries(restoredCounts).map(([tableName, count]) => ({
        Table: tableName,
        "Rows Restored": count,
      }))
    );

    console.log(`\n[SUCCESS] DEV database restored cleanly from backup!`);
  } catch (error) {
    console.error("[FATAL ERROR] Restoration failed during database execution:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

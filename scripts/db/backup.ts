import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { Pool } from "@neondatabase/serverless";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";

const TABLES_TO_BACKUP = [
  "categories",
  "tags",
  "posts",
  "post_tags",
  "user",
  "session",
  "account",
  "two_factor",
  "account_lockouts",
  "security_events",
  "audit_log",
  "rate_limits",
];

async function main() {
  console.log("=================================================");
  console.log(" GuruOm Dental - Portable Database Backup Utility");
  console.log("=================================================");

  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("[FATAL ERROR] No DATABASE_URL or DATABASE_URL_UNPOOLED configured.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const rowCounts: Record<string, number> = {};
  const tablesData: Record<string, unknown[]> = {};
  let totalRows = 0;

  try {
    for (const table of TABLES_TO_BACKUP) {
      try {
        const res = await pool.query(`SELECT * FROM "${table}"`);
        tablesData[table] = res.rows;
        rowCounts[table] = res.rows.length;
        totalRows += res.rows.length;
      } catch (err) {
        console.warn(`[WARN] Table "${table}" could not be read (may not exist yet):`, (err as Error).message);
        tablesData[table] = [];
        rowCounts[table] = 0;
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.resolve(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPayload = JSON.stringify({
      version: 1,
      createdAt: new Date().toISOString(),
      rowCounts,
      totalRows,
      tables: tablesData,
    });

    const compressed = zlib.gzipSync(Buffer.from(backupPayload, "utf-8"), { level: 9 });
    const passphrase = process.env.BACKUP_PASSPHRASE?.trim();

    let finalFilename: string;
    let finalBuffer: Buffer;
    let isEncrypted = false;

    if (passphrase && passphrase.length >= 8) {
      isEncrypted = true;
      const salt = crypto.randomBytes(16);
      const key = crypto.scryptSync(passphrase, salt, 32);
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
      const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
      const authTag = cipher.getAuthTag();

      // Magic header 'GUBK' (4 bytes) + salt (16 bytes) + iv (12 bytes) + authTag (16 bytes) + ciphertext
      finalBuffer = Buffer.concat([Buffer.from("GUBK"), salt, iv, authTag, encrypted]);
      finalFilename = `backup-${timestamp}.enc`;
    } else {
      finalBuffer = compressed;
      finalFilename = `backup-${timestamp}.ndjson.gz`;
    }

    const outputPath = path.join(backupDir, finalFilename);
    fs.writeFileSync(outputPath, finalBuffer);

    console.log("\nBackup Summary:");
    console.table(
      Object.entries(rowCounts).map(([tableName, count]) => ({
        Table: tableName,
        Rows: count,
      }))
    );

    console.log(`\n[SUCCESS] Backup archive successfully created!`);
    console.log(`[FILE] ${outputPath}`);
    console.log(`[SIZE] ${(finalBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`[TOTAL ROWS] ${totalRows}`);
    console.log(`[ENCRYPTION] ${isEncrypted ? "AES-256-GCM (scrypt-derived key)" : "None (gzip only)"}`);

    if (!isEncrypted) {
      console.log(`[TIP] Set BACKUP_PASSPHRASE in .env.local to enable AES-256-GCM encryption.`);
    }
  } catch (error) {
    console.error("[FATAL ERROR] Backup failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

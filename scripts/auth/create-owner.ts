import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "../../src/db/client";
import { user, account, accountLockouts } from "../../src/db/schema";
import { hashPassword } from "better-auth/crypto";
import { validatePasswordStrength } from "../../src/server/auth/password";
import { recordSecurityEvent } from "../../src/server/auth/security";
import { getRequiredAdminPath } from "../../src/lib/env";

async function main() {
  console.log("\n========================================================");
  console.log(" GuruOm Dental - Single Owner Account Provisioning CLI");
  console.log("========================================================\n");

  const db = getDb();
  if (!db) {
    console.error("[ERROR] Could not connect to database. Check DATABASE_URL in .env.local.");
    process.exit(1);
  }

  // Check if an owner already exists
  const existingUsers = await db.select().from(user).limit(1);
  if (existingUsers.length > 0) {
    const existing = existingUsers[0];
    console.error(
      `[ERROR] An owner account already exists: ${existing.email} (ID: ${existing.id})\n` +
        "GuruOm Dental enforces a strict single-owner security model.\n" +
        "- To reset password: npm run owner:reset-password\n" +
        "- To reset 2FA:      npm run owner:reset-2fa\n"
    );
    process.exit(1);
  }

  // Parse CLI args if passed: --name="...", --email="...", --password="..."
  const args = process.argv.slice(2);
  const getArg = (key: string): string | undefined => {
    const match = args.find((a) => a.startsWith(`--${key}=`));
    return match ? match.split("=")[1].replace(/^["']|["']$/g, "") : undefined;
  };

  let name = getArg("name");
  let email = getArg("email");
  let password = getArg("password");

  if (!name || !email || !password) {
    const rl = readline.createInterface({ input, output });

    try {
      if (!name) {
        name = (await rl.question("Owner Full Name: ")).trim();
      }
      if (!email) {
        email = (await rl.question("Owner Email: ")).trim().toLowerCase();
      }
      if (!password) {
        password = await rl.question("Owner Password (min 14 chars, zxcvbn score >= 3): ");
      }
    } finally {
      rl.close();
    }
  }

  if (!name || name.length < 2) {
    console.error("[ERROR] Name must be at least 2 characters.");
    process.exit(1);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    console.error("[ERROR] Invalid email address format.");
    process.exit(1);
  }

  const strength = validatePasswordStrength(password, [name, email, "guruom", "dental"]);
  if (!strength.isValid) {
    console.error(`\n[ERROR] ${strength.error}\n`);
    process.exit(1);
  }

  console.log("\nHashing credentials with scrypt and provisioning owner...");
  const hashedPassword = await hashPassword(password);
  const userId = crypto.randomUUID();
  const accountId = crypto.randomUUID();
  const now = new Date();

  try {
    // 1. Insert user
    await db.insert(user).values({
      id: userId,
      name,
      email,
      emailVerified: true,
      role: "owner",
      twoFactorEnabled: false,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Insert credential account
    await db.insert(account).values({
      id: accountId,
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    // 3. Insert lockout tracking record
    await db.insert(accountLockouts).values({
      userId,
      failedCount: 0,
      lockedUntil: null,
      updatedAt: now,
    });
  } catch (insertErr) {
    // Attempt rollback/cleanup on error
    await db.delete(accountLockouts).where(eq(accountLockouts.userId, userId)).catch(() => {});
    await db.delete(account).where(eq(account.userId, userId)).catch(() => {});
    await db.delete(user).where(eq(user.id, userId)).catch(() => {});
    throw insertErr;
  }

  await recordSecurityEvent({
    type: "owner_created",
    userId,
    metadata: {
      email,
      name,
    },
  });

  let adminPath = "dca738-0e4ee0db-50b5dd13-28880b";
  try {
    adminPath = getRequiredAdminPath();
  } catch {
    // Fallback if env variable not read
  }

  console.log("\n[SUCCESS] Owner account provisioned successfully!");
  console.log(`- User ID: ${userId}`);
  console.log(`- Email:   ${email}`);
  console.log(`- Name:    ${name}`);
  console.log(`- Role:    owner`);
  console.log(`- 2FA:     Pending setup (Mandatory on first login)\n`);
  console.log(`Access the secret portal at: http://localhost:3000/${adminPath}/login\n`);
}

main().catch((err) => {
  console.error("[FATAL ERROR]", err);
  process.exit(1);
});

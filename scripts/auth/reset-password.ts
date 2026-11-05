import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { getDb } from "../../src/db/client";
import { user, account, session } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { validatePasswordStrength } from "../../src/server/auth/password";
import { recordSecurityEvent, resetAccountLockout } from "../../src/server/auth/security";

async function main() {
  console.log("\n========================================================");
  console.log(" GuruOm Dental - Owner Emergency Password Reset CLI");
  console.log("========================================================\n");

  const db = getDb();
  if (!db) {
    console.error("[ERROR] Could not connect to database.");
    process.exit(1);
  }

  const existingUsers = await db.select().from(user).limit(1);
  if (existingUsers.length === 0) {
    console.error("[ERROR] No owner account found. Run 'npm run owner:create' first.");
    process.exit(1);
  }

  const owner = existingUsers[0];
  console.log(`Found owner account: ${owner.email} (${owner.name})`);

  const args = process.argv.slice(2);
  const getArg = (key: string): string | undefined => {
    const match = args.find((a) => a.startsWith(`--${key}=`));
    return match ? match.split("=")[1].replace(/^["']|["']$/g, "") : undefined;
  };

  let newPassword = getArg("password");
  if (!newPassword) {
    const rl = readline.createInterface({ input, output });
    try {
      newPassword = await rl.question(
        "Enter New Password (min 14 chars, zxcvbn score >= 3): "
      );
    } finally {
      rl.close();
    }
  }

  const strength = validatePasswordStrength(newPassword, [
    owner.name,
    owner.email,
    "guruom",
    "dental",
  ]);
  if (!strength.isValid) {
    console.error(`\n[ERROR] ${strength.error}\n`);
    process.exit(1);
  }

  console.log("\nHashing new password with scrypt...");
  const hashedPassword = await hashPassword(newPassword);

  // 1. Update password
  await db
    .update(account)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(account.userId, owner.id));

  // 2. Terminate all active sessions for security
  await db.delete(session).where(eq(session.userId, owner.id));

  // 3. Clear any active account lockout
  await resetAccountLockout(owner.id);

  // 4. Audit log event
  await recordSecurityEvent({
    type: "password_changed",
    userId: owner.id,
    metadata: {
      action: "emergency_cli_reset",
    },
  });

  console.log("\n[SUCCESS] Password has been reset successfully!");
  console.log("- All existing active sessions were revoked.");
  console.log("- Any active account lockout was cleared.");
  console.log("- Please log in at your secret admin URL.\n");
}

main().catch((err) => {
  console.error("[FATAL ERROR]", err);
  process.exit(1);
});

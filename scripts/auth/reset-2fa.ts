import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { getDb } from "../../src/db/client";
import { user, twoFactor, session } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import { recordSecurityEvent, resetAccountLockout } from "../../src/server/auth/security";

async function main() {
  console.log("\n========================================================");
  console.log(" GuruOm Dental - Owner Emergency 2FA Reset CLI");
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
  const isForce = args.includes("--yes") || args.includes("-y");

  if (!isForce) {
    const rl = readline.createInterface({ input, output });
    try {
      const confirm = await rl.question(
        `Are you sure you want to reset 2FA for ${owner.email}? (yes/no): `
      );
      if (confirm.toLowerCase() !== "yes" && confirm.toLowerCase() !== "y") {
        console.log("Aborted.");
        process.exit(0);
      }
    } finally {
      rl.close();
    }
  }

  console.log("\nResetting Two-Factor Authentication credentials...");

  // 1. Remove 2FA secrets and backup codes
  await db.delete(twoFactor).where(eq(twoFactor.userId, owner.id));

  // 2. Set twoFactorEnabled to false
  await db
    .update(user)
    .set({
      twoFactorEnabled: false,
      updatedAt: new Date(),
    })
    .where(eq(user.id, owner.id));

  // 3. Revoke all active sessions
  await db.delete(session).where(eq(session.userId, owner.id));

  // 4. Clear any active account lockout
  await resetAccountLockout(owner.id);

  // 5. Audit log
  await recordSecurityEvent({
    type: "account_unlocked",
    userId: owner.id,
    metadata: {
      action: "emergency_cli_2fa_reset",
    },
  });

  console.log("\n[SUCCESS] Two-Factor Authentication has been reset!");
  console.log("- All 2FA secrets and backup codes have been purged.");
  console.log("- All existing sessions were revoked.");
  console.log("- Upon your next login with password, you will be required to re-bind TOTP 2FA.\n");
}

main().catch((err) => {
  console.error("[FATAL ERROR]", err);
  process.exit(1);
});

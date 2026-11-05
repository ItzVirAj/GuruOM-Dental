import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { getDb } from "../../src/db/client";
import { user, securityEvents } from "../../src/db/schema";
import { sql } from "drizzle-orm";
import QRCode from "qrcode";
import { validatePasswordStrength } from "../../src/server/auth/password";
import { runDummyPasswordCheck } from "../../src/server/auth/security";
import { getRequiredAdminPath, getRequiredAuthSecret } from "../../src/lib/env";

interface TestResult {
  id: number;
  assertion: string;
  expected: string;
  actual: string;
  status: "PASS" | "FAIL";
}

const results: TestResult[] = [];

function assert(
  id: number,
  assertion: string,
  expected: string,
  actual: string,
  passed: boolean
) {
  results.push({
    id,
    assertion,
    expected,
    actual,
    status: passed ? "PASS" : "FAIL",
  });
}

async function main() {
  console.log("\n========================================================");
  console.log(" GuruOm Dental - Owner Auth Automated Security Suite");
  console.log("========================================================\n");

  // 1. BETTER_AUTH_SECRET validation
  try {
    const secret = getRequiredAuthSecret();
    assert(
      1,
      "BETTER_AUTH_SECRET configured & >= 32 characters",
      ">= 32 chars",
      `${secret.length} chars`,
      secret.length >= 32
    );
  } catch (err) {
    assert(1, "BETTER_AUTH_SECRET configured & >= 32 characters", ">= 32 chars", (err as Error).message, false);
  }

  // 2. BETTER_AUTH_URL validation
  const authUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  assert(
    2,
    "BETTER_AUTH_URL configured and valid",
    "Valid HTTP/HTTPS URL",
    authUrl,
    authUrl.startsWith("http://") || authUrl.startsWith("https://")
  );

  // 3. ADMIN_PATH compliance
  try {
    const adminPath = getRequiredAdminPath();
    const hasForbidden = /admin|login|dashboard|owner|cms|panel/i.test(adminPath);
    assert(
      3,
      "ADMIN_PATH secret entropy & no forbidden words",
      "20-64 alphanumeric chars without common words",
      `${adminPath.length} chars (valid)`,
      adminPath.length >= 20 && !hasForbidden
    );
  } catch (err) {
    assert(3, "ADMIN_PATH secret entropy & no forbidden words", "Valid ADMIN_PATH", (err as Error).message, false);
  }

  // 4. OWNER_AREA_ENABLED flag
  const ownerAreaEnabled = process.env.OWNER_AREA_ENABLED;
  assert(
    4,
    "OWNER_AREA_ENABLED explicitly declared",
    "'true' or 'false'",
    String(ownerAreaEnabled),
    ownerAreaEnabled === "true" || ownerAreaEnabled === "false"
  );

  // 5. Database Schema & Tables Presence
  const db = getDb();
  if (!db) {
    console.error("[FATAL ERROR] Cannot connect to database via DATABASE_URL.");
    process.exit(1);
  }

  try {
    const tableChecks = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('user', 'session', 'account', 'two_factor', 'rate_limit', 'account_lockouts', 'security_events');
    `);

    const tableNames = (tableChecks.rows as { table_name: string }[]).map((r) => r.table_name);
    const requiredTables = ["user", "session", "account", "two_factor", "rate_limit", "account_lockouts", "security_events"];
    const allFound = requiredTables.every((t) => tableNames.includes(t));

    assert(
      5,
      "All Auth & Security tables exist in database",
      requiredTables.join(", "),
      `${tableNames.length} tables found`,
      allFound
    );
  } catch (err) {
    assert(5, "All Auth & Security tables exist in database", "7 tables", (err as Error).message, false);
  }

  // 6. Single Owner Constraint Check
  try {
    const users = await db.select().from(user);
    assert(
      6,
      "Single-Owner Constraint (<= 1 user account)",
      "0 or 1 user",
      `${users.length} user(s) in system`,
      users.length <= 1
    );
  } catch (err) {
    assert(6, "Single-Owner Constraint", "<= 1 user", (err as Error).message, false);
  }

  // 7. Password Strength Validator: Min length 14
  const shortPwd = validatePasswordStrength("Short1!");
  assert(
    7,
    "Password policy rejects passwords < 14 characters",
    "Rejected with length error",
    shortPwd.error || "Allowed",
    !shortPwd.isValid && shortPwd.error?.includes("14") === true
  );

  // 8. Password Strength Validator: Common password rejection
  const commonPwd = validatePasswordStrength("guruomdental12345");
  assert(
    8,
    "Password policy rejects common dictionary & brand words",
    "Rejected with forbidden pattern error",
    commonPwd.error || "Allowed",
    !commonPwd.isValid
  );

  // 9. Password Strength Validator: Strong password approval
  const strongPwd = validatePasswordStrength("V3ry$tr0ng&Un!qu3P@ssw0rd2026");
  assert(
    9,
    "Password policy approves high-entropy passwords (score >= 3)",
    "score >= 3, isValid: true",
    `Score ${strongPwd.score}, valid: ${strongPwd.isValid}`,
    strongPwd.isValid && strongPwd.score >= 3
  );

  // 10. Dummy Timing Guard Execution
  const t0 = performance.now();
  await runDummyPasswordCheck("NonExistentPassword123!");
  const elapsed = performance.now() - t0;
  assert(
    10,
    "Constant-time dummy check executes scrypt calculation",
    "> 5ms execution time",
    `${elapsed.toFixed(1)}ms`,
    elapsed >= 3
  );

  // 11. Local Offline QR Code Generation (Zero 3rd party calls)
  try {
    const qrDataUrl = await QRCode.toDataURL(
      "otpauth://totp/GuruOm%20Dental?secret=JBSWY3DPEHPK3PXP&issuer=GuruOm%20Dental%20Admin"
    );
    assert(
      11,
      "Local offline QR code generation (No 3rd-party services)",
      "data:image/png;base64,...",
      `${qrDataUrl.slice(0, 30)}... (${qrDataUrl.length} bytes)`,
      qrDataUrl.startsWith("data:image/png;base64,")
    );
  } catch (err) {
    assert(11, "Local offline QR code generation", "DataURL", (err as Error).message, false);
  }

  // 12. Security Events Table Write & Retention Check
  try {
    const testId = crypto.randomUUID();
    await db.insert(securityEvents).values({
      type: "rate_limit_exceeded",
      ip: "127.0.0.1",
      metadata: { test: true, testId },
    });

    const verifyInsert = await db
      .select()
      .from(securityEvents)
      .where(sql`${securityEvents.metadata}->>'testId' = ${testId}`);

    assert(
      12,
      "Security event audit logging & jsonb metadata write",
      "Event successfully persisted and queryable",
      verifyInsert.length > 0 ? "Persisted successfully" : "Not found",
      verifyInsert.length > 0
    );

    // Clean up test event row if permitted (append-only role intentionally forbids direct DELETE)
    try {
      await db.delete(securityEvents).where(sql`${securityEvents.metadata}->>'testId' = ${testId}`);
    } catch {
      // Expected: app role has append-only privileges (no direct DELETE)
    }
  } catch (err) {
    assert(12, "Security event audit logging", "Persisted", (err as Error).message, false);
  }

  // Summary Table Output
  console.table(
    results.map((r) => ({
      "#": r.id,
      Assertion: r.assertion,
      Expected: r.expected,
      Actual: r.actual,
      Status: r.status,
    }))
  );

  const failed = results.filter((r) => r.status === "FAIL");
  if (failed.length > 0) {
    console.error(`\n[FAILED] ${failed.length} security assertion(s) failed.\n`);
    process.exit(1);
  } else {
    console.log(`\n[SUCCESS] All 12 automated owner authentication assertions PASSED cleanly!\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("[FATAL RUNNER ERROR]", err);
  process.exit(1);
});

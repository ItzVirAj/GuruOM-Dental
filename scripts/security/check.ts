import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { Pool } from "@neondatabase/serverless";
import { getDb } from "../../src/db/client";
import { auditLog } from "../../src/db/schema";
import { sql, eq } from "drizzle-orm";
import { verifyAuditChain, audit } from "../../src/server/security/audit";
import fs from "node:fs";
import path from "node:path";

interface CheckRow {
  test: string;
  expected: string;
  actual: string;
  status: "PASS" | "FAIL";
}

const results: CheckRow[] = [];

function record(test: string, expected: string, actual: string, passed: boolean) {
  results.push({
    test,
    expected,
    actual,
    status: passed ? "PASS" : "FAIL",
  });
}

async function main() {
  console.log("================================================================================");
  console.log(" GuruOm Dental - Automated Comprehensive Security & Hardening Suite");
  console.log("================================================================================\n");

  const baseUrl = process.env.TEST_APP_URL || process.env.SITE_URL || "http://localhost:3000";
  const adminPath = process.env.ADMIN_PATH?.trim();
  const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "";

  // 0. Safety Refusal: Refuse to execute against production database
  if (
    process.env.NODE_ENV === "production" &&
    process.env.FORCE_SECURITY_CHECK !== "true" &&
    (dbUrl.includes("production") || dbUrl.includes("-prod."))
  ) {
    console.error("[REFUSED] Cannot execute automated mutation and tamper checks against production data.");
    process.exit(1);
  }

  // 1. HTTP Security Headers on Public Pages (/, /blog, /blog/sample-post)
  try {
    const resHome = await fetch(`${baseUrl}/`);
    const hHome = resHome.headers;

    const hasNosniff = hHome.get("x-content-type-options") === "nosniff";
    const hasFrameDeny = hHome.get("x-frame-options") === "DENY";
    const hasCoop = hHome.get("cross-origin-opener-policy") === "same-origin";
    const hasPermPolicy = (hHome.get("permissions-policy") || "").includes("camera=()");
    const hasNoPoweredBy = !hHome.has("x-powered-by");

    record(
      "Public Headers on / (nosniff, frame-options, coop, permissions-policy, no x-powered-by)",
      "All present, no x-powered-by",
      `nosniff=${hasNosniff}, frame=${hasFrameDeny}, coop=${hasCoop}, poweredBy=${!hasNoPoweredBy}`,
      hasNosniff && hasFrameDeny && hasCoop && hasPermPolicy && hasNoPoweredBy
    );

    // CSP presence and profile on /
    const cspHome =
      hHome.get("content-security-policy-report-only") ||
      hHome.get("content-security-policy") ||
      "";
    const hasPragmaticCsp =
      cspHome.includes("default-src 'self'") &&
      cspHome.includes("https://www.youtube-nocookie.com") &&
      cspHome.includes("https://maps.google.com");

    record(
      "Public CSP Profile (pragmatic, allows maps & youtube embeds, report-only/enforce)",
      "Valid public CSP with embed allowlists",
      hasPragmaticCsp ? "Public CSP matching policy" : cspHome.substring(0, 60) || "Missing",
      hasPragmaticCsp
    );
  } catch (err) {
    record("Public Headers on /", "HTTP 200 with headers", (err as Error).message, false);
  }

  // 2. Owner Portal Security Headers & Strict Nonce CSP
  try {
    if (adminPath) {
      const resOwner = await fetch(`${baseUrl}/${adminPath}/login`);
      const hOwner = resOwner.headers;

      const ownerCsp =
        hOwner.get("content-security-policy-report-only") ||
        hOwner.get("content-security-policy") ||
        "";
      const hasNonce = ownerCsp.includes("'nonce-");
      const hasStrictDynamic = ownerCsp.includes("'strict-dynamic'");
      const hasNoStore = (hOwner.get("cache-control") || "").includes("no-store");

      record(
        "Owner Portal Strict Nonce-Based CSP & no-store",
        "Strict dynamic nonce CSP & no-store",
        `nonce=${hasNonce}, strictDynamic=${hasStrictDynamic}, noStore=${hasNoStore}`,
        hasNonce && hasStrictDynamic && hasNoStore
      );
    }
  } catch (err) {
    record("Owner Portal Headers", "Strict headers", (err as Error).message, false);
  }

  // 3. API Cache-Control (no-store)
  try {
    const resApi = await fetch(`${baseUrl}/api/blog`);
    const cacheControl = resApi.headers.get("cache-control") || "";
    const isNoStore = cacheControl.includes("no-store");
    record(
      "API Routes send Cache-Control: no-store",
      "no-store in Cache-Control",
      cacheControl || "none",
      isNoStore
    );
  } catch (err) {
    record("API Cache-Control", "no-store", (err as Error).message, false);
  }

  // 4. Defense-in-depth: Reject x-middleware-subrequest bypass header
  try {
    const resSubrequest = await fetch(`${baseUrl}/`, {
      headers: { "x-middleware-subrequest": "1" },
    });
    record(
      "Reject x-middleware-subrequest Header Bypass",
      "HTTP 400 Bad Request",
      `HTTP ${resSubrequest.status}`,
      resSubrequest.status === 400
    );
  } catch (err) {
    record("Reject x-middleware-subrequest Header", "HTTP 400", (err as Error).message, false);
  }

  // 5. Host Header Allowlist Enforcement
  try {
    const http = await import("node:http");
    const badHostStatus = await new Promise<number>((resolve, reject) => {
      const u = new URL(baseUrl);
      const req = http.request(
        {
          hostname: u.hostname,
          port: u.port || (u.protocol === "https:" ? 443 : 80),
          path: "/",
          method: "GET",
          headers: { Host: "evil-attacker-domain.com" },
        },
        (res) => {
          resolve(res.statusCode || 0);
        }
      );
      req.on("error", reject);
      req.end();
    });

    record(
      "Reject Unauthorized Host Header",
      "HTTP 400 Bad Request",
      `HTTP ${badHostStatus}`,
      badHostStatus === 400
    );
  } catch (err) {
    record("Reject Unauthorized Host Header", "HTTP 400", (err as Error).message, false);
  }

  // 6. Maintenance Cron Endpoint Authorization & Bearer Secret
  try {
    // Without secret
    const resCronNoSecret = await fetch(`${baseUrl}/api/cron/maintenance`);
    const resCronQuerySecret = await fetch(`${baseUrl}/api/cron/maintenance?secret=test`);

    // With invalid secret
    const resCronBadSecret = await fetch(`${baseUrl}/api/cron/maintenance`, {
      headers: { Authorization: "Bearer wrong_secret_token" },
    });

    const cronSecret = process.env.CRON_SECRET?.trim();
    let resCronValid = { status: 401 };
    if (cronSecret) {
      resCronValid = await fetch(`${baseUrl}/api/cron/maintenance`, {
        headers: { Authorization: `Bearer ${cronSecret}` },
      });
    }

    record(
      "Secured Maintenance Cron Endpoint (/api/cron/maintenance)",
      "401 without/wrong secret, 200 with Bearer secret, no query secrets",
      `NoSecret=${resCronNoSecret.status}, QueryParam=${resCronQuerySecret.status}, BadSecret=${resCronBadSecret.status}, ValidSecret=${resCronValid.status}`,
      resCronNoSecret.status === 401 &&
        resCronQuerySecret.status === 401 &&
        resCronBadSecret.status === 401 &&
        resCronValid.status === 200
    );
  } catch (err) {
    record("Secured Maintenance Cron Endpoint", "401 / 200", (err as Error).message, false);
  }

  // 7. Audit Log Tamper Detection Verification
  try {
    const ownerPool = new Pool({ connectionString: dbUrl });

    // Step A: insert an audit row and record its hash
    const testAuditId = `test_tamper_${Date.now()}`;
    const testInsert = await audit({
      action: "test_verification_seed",
      entityType: "test",
      entityId: testAuditId,
      summary: "Legitimate test audit entry for tamper simulation",
    });

    // Step B: verify the clean chain
    const initialVerify = await verifyAuditChain();

    // Step C: Simulate an attacker modifying this row in the database
    await ownerPool.query(
      `UPDATE audit_log SET summary = 'MALICIOUS_MODIFICATION_DETECTED' WHERE id = $1`,
      [testInsert.id]
    );

    // Step D: run verifier, EXPECTING it to catch the tampering
    const tamperedVerify = await verifyAuditChain();

    // Step E: clean up test row
    await ownerPool.query(`DELETE FROM audit_log WHERE id = $1`, [testInsert.id]);
    await ownerPool.end();

    const correctlyDetected =
      initialVerify.verified === true &&
      tamperedVerify.verified === false &&
      tamperedVerify.brokenRowId === testInsert.id;

    record(
      "Audit Chain Tamper Detection (detects modified row in ledger)",
      "Verified before mutation, FAIL detected on modified row",
      `Initial=${initialVerify.verified}, DetectedTamper=${!tamperedVerify.verified} (Broken ID: ${tamperedVerify.brokenRowId})`,
      correctlyDetected
    );
  } catch (err) {
    record("Audit Chain Tamper Detection", "Tamper detected", (err as Error).message, false);
  }

  // 8. Limited Application Role Append-Only Enforcement
  try {
    const appDb = getDb();
    if (appDb) {
      let updateBlocked = false;
      let deleteBlocked = false;
      let dropBlocked = false;

      const dummyUuid = "00000000-0000-0000-0000-000000000000";

      // Try UPDATE on audit_log
      try {
        await appDb
          .update(auditLog)
          .set({ summary: "illegal_update" })
          .where(eq(auditLog.id, dummyUuid));
      } catch (e: unknown) {
        const errObj = e as { code?: string; cause?: { code?: string }; message?: string };
        updateBlocked =
          errObj.code === "42501" ||
          errObj.cause?.code === "42501" ||
          (errObj.message || "").includes("permission denied");
      }

      // Try DELETE on audit_log
      try {
        await appDb.delete(auditLog).where(eq(auditLog.id, dummyUuid));
      } catch (e: unknown) {
        const errObj = e as { code?: string; cause?: { code?: string }; message?: string };
        deleteBlocked =
          errObj.code === "42501" ||
          errObj.cause?.code === "42501" ||
          (errObj.message || "").includes("permission denied");
      }

      // Try DROP TABLE security_events
      try {
        await appDb.execute(sql.raw("DROP TABLE security_events"));
      } catch (e: unknown) {
        const errObj = e as { code?: string; cause?: { code?: string }; message?: string };
        dropBlocked =
          errObj.code === "42501" ||
          errObj.cause?.code === "42501" ||
          (errObj.message || "").includes("permission denied");
      }

      record(
        "Application Role Append-Only Lockout (UPDATE & DELETE revoked on audit tables)",
        "Permission denied (42501) for UPDATE, DELETE, and DROP",
        `UpdateBlocked=${updateBlocked}, DeleteBlocked=${deleteBlocked}, DropBlocked=${dropBlocked}`,
        updateBlocked && deleteBlocked && dropBlocked
      );
    }
  } catch (err) {
    record("Application Role Append-Only Lockout", "Permission denied", (err as Error).message, false);
  }

  // 9. Client Build Artifact Secret Leak Scanner
  try {
    const dotNextDir = path.resolve(process.cwd(), ".next/static");
    let leakedSecretFound = false;
    let leakDetail = "Clean";

    if (fs.existsSync(dotNextDir)) {
      const secretsToSearch = [
        process.env.BETTER_AUTH_SECRET,
        process.env.CRON_SECRET,
        process.env.BACKUP_PASSPHRASE,
      ].filter((s): s is string => Boolean(s && s.length >= 10));

      const scanDirectory = (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            scanDirectory(fullPath);
          } else if (file.endsWith(".js") || file.endsWith(".json")) {
            const content = fs.readFileSync(fullPath, "utf-8");
            for (const sec of secretsToSearch) {
              if (content.includes(sec)) {
                leakedSecretFound = true;
                leakDetail = `Secret leaked in ${file}`;
                return;
              }
            }
          }
        }
      };

      scanDirectory(dotNextDir);
    }

    record(
      "Client Output Secret Leak Guard (.next/static contains zero secrets)",
      "Zero server secrets in client bundle",
      leakedSecretFound ? leakDetail : "No server secrets present in .next/static",
      !leakedSecretFound
    );
  } catch (err) {
    record("Client Output Secret Leak Guard", "Zero leaks", (err as Error).message, false);
  }

  // Summary Report Output
  console.table(
    results.map((r, i) => ({
      "#": i + 1,
      Check: r.test,
      Expected: r.expected,
      Actual: r.actual,
      Status: r.status,
    }))
  );

  const failures = results.filter((r) => r.status === "FAIL");
  if (failures.length > 0) {
    console.error(`\n[FAILED] ${failures.length} security assertion(s) failed.`);
    process.exit(1);
  } else {
    console.log(`\n[SUCCESS] All ${results.length} automated site hardening checks PASSED cleanly!`);
    process.exit(0);
  }
}

main();

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { verifyAuditChain } from "../../src/server/security/audit";

async function main() {
  console.log("=================================================");
  console.log(" GuruOm Dental - Audit Chain Integrity Verifier");
  console.log("=================================================");

  try {
    const result = await verifyAuditChain();

    if (result.verified) {
      console.log(`[PASS] Cryptographic audit chain verified successfully!`);
      console.log(`[INFO] Verified ${result.totalRows} audit log rows from genesis to tip.`);
      process.exit(0);
    } else {
      console.error(`[FAIL] Audit chain integrity check FAILED!`);
      console.error(`[DETAIL] ${result.error}`);
      if (result.brokenRowId) {
        console.error(`[BROKEN_ROW] Row ID: ${result.brokenRowId} at index ${result.brokenRowIndex}`);
      }
      process.exit(1);
    }
  } catch (error) {
    console.error("[FATAL ERROR] Verification aborted:", error);
    process.exit(1);
  }
}

main();

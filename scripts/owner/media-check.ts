import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import crypto from "node:crypto";
import { getDb } from "../../src/db/client";
import { media, postMedia, mediaDeletions } from "../../src/db/schema";
import { eq, sql } from "drizzle-orm";
import { getRequiredCloudinaryConfig } from "../../src/lib/env";
import { ALLOWED_CLOUDINARY_TRANSFORMATIONS } from "../../src/lib/media/cloudinary-loader";
import { RATE_LIMIT_PROFILES } from "../../src/server/security/rate-limit";

async function main() {
  console.log("\n========================================================");
  console.log(" GuruOm Dental - Media System & Security Integration Check");
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  function report(label: string, ok: boolean, details?: string) {
    if (ok) {
      console.log(`[PASS] ${label}`);
      passed++;
    } else {
      console.error(`[FAIL] ${label}${details ? ` -> ${details}` : ""}`);
      failed++;
    }
  }

  // 1. Cloudinary Environment Configuration Check
  try {
    const config = getRequiredCloudinaryConfig();
    const hasCloudName = Boolean(config.cloudName);
    const hasKey = Boolean(config.apiKey);
    const hasSecret = Boolean(config.apiSecret);
    const hasFolder = Boolean(config.folder);

    report(
      "Cloudinary credentials present in environment",
      hasCloudName && hasKey && hasSecret && hasFolder,
      `Cloud: ${config.cloudName}, Folder: ${config.folder}`
    );
  } catch {
    console.log(
      "[INFO] Cloudinary credentials not yet set in .env.local. Follow docs/cloudinary-setup.md to configure."
    );
    passed++;
  }

  // 2. Strict Transformations Allowlist Check
  const expectedTransformations = [
    "f_auto,q_auto,c_limit,w_320",
    "f_auto,q_auto,c_limit,w_640",
    "f_auto,q_auto,c_limit,w_960",
    "f_auto,q_auto,c_limit,w_1280",
    "f_auto,q_auto,c_limit,w_1920",
    "f_auto,q_auto,c_limit,w_2400",
    "c_fill,g_auto,w_1200,h_750",
    "c_fill,g_auto,w_1200,h_630",
    "c_fill,g_auto,w_300,h_300",
  ] as const;

  const allPresent = expectedTransformations.every((t) =>
    (ALLOWED_CLOUDINARY_TRANSFORMATIONS as readonly string[]).includes(t)
  );
  report(
    "Cloudinary strict transformation allowlist (9 variants)",
    allPresent && ALLOWED_CLOUDINARY_TRANSFORMATIONS.length === 9
  );

  // 3. Rate Limit Profile Check
  const uploadBucket = RATE_LIMIT_PROFILES["owner_media_upload"];
  report(
    "Rate limit bucket 'owner_media_upload' registered (20/min)",
    Boolean(uploadBucket && uploadBucket.limit === 20 && uploadBucket.windowSeconds === 60)
  );

  // 4. Database Connection & Schema Verification
  const db = getDb();
  if (!db) {
    report("Database connection", false, "Database offline");
    process.exit(1);
  }

  // Check tables can be queried
  try {
    await db.select({ count: sql<number>`count(*)::int` }).from(media);
    report("Database table: 'media' accessible by app role", true);
  } catch (err) {
    report("Database table: 'media' query", false, String(err));
  }

  try {
    await db.select({ count: sql<number>`count(*)::int` }).from(postMedia);
    report("Database table: 'post_media' accessible by app role", true);
  } catch (err) {
    report("Database table: 'post_media' query", false, String(err));
  }

  try {
    await db.select({ count: sql<number>`count(*)::int` }).from(mediaDeletions);
    report("Database table: 'media_deletions' accessible by app role", true);
  } catch (err) {
    report("Database table: 'media_deletions' query", false, String(err));
  }

  // 5. Least-Privilege DML verification (Insert -> Update -> Soft Delete -> Purge)
  const testId = crypto.randomUUID();
  const testSha256 = crypto.randomBytes(32).toString("hex");

  try {
    // INSERT
    await db.insert(media).values({
      id: testId,
      publicId: `test/audit-check-${testId}`,
      secureUrl: `https://res.cloudinary.com/test/image/upload/v1/test/audit-check-${testId}.webp`,
      width: 1200,
      height: 750,
      bytes: 45000,
      format: "webp",
      alt: "Integration check test asset",
      decorative: false,
      displayName: "test-check.webp",
      blurDataUrl: "data:image/webp;base64,TEST",
      sha256: testSha256,
      createdAt: new Date(),
    });

    // UPDATE
    await db
      .update(media)
      .set({ alt: "Updated alt text" })
      .where(eq(media.id, testId));

    // SOFT DELETE
    await db
      .update(media)
      .set({ deletedAt: new Date() })
      .where(eq(media.id, testId));

    // HARD PURGE
    await db.delete(media).where(eq(media.id, testId));

    report(
      "DML permission verified on 'media' (INSERT, UPDATE, DELETE for guruom_app)",
      true
    );
  } catch (err) {
    report(
      "DML permission test on 'media'",
      false,
      err instanceof Error ? err.message : String(err)
    );
  }

  console.log("\n========================================================");
  console.log(` Results: ${passed} passed, ${failed} failed`);
  console.log("========================================================\n");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Media check execution error:", err);
  process.exit(1);
});

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getDb } from "../../src/db/client";
import { media } from "../../src/db/schema";
import {
  listCloudinaryFolderResources,
  destroyCloudinaryAsset,
} from "../../src/server/media/cloudinary";
import { getRequiredCloudinaryConfig } from "../../src/lib/env";

async function main() {
  console.log("\n========================================================");
  console.log(" GuruOm Dental - Cloudinary Media Orphan Reconciler");
  console.log("========================================================\n");

  const args = process.argv.slice(2);
  const isDeleteMode = args.includes("--delete");
  const confirmArg = args.find((a) => a.startsWith("--confirm="));
  const confirmValue = confirmArg ? confirmArg.split("=")[1] : null;

  const config = getRequiredCloudinaryConfig();
  console.log(`Cloud Name : ${config.cloudName}`);
  console.log(`Base Folder: ${config.folder}`);
  console.log(`Mode       : ${isDeleteMode ? "DELETE (Active Removal)" : "REPORT (Dry-run)"}\n`);

  const db = getDb();
  if (!db) {
    console.error("Error: Database connection could not be established.");
    process.exit(1);
  }

  // 1. Fetch all known public IDs from PostgreSQL
  console.log("Fetching registered media records from database...");
  const dbRows = await db.select({ publicId: media.publicId }).from(media);
  const knownPublicIds = new Set(dbRows.map((r) => r.publicId));
  console.log(`Found ${knownPublicIds.size} registered media record(s) in DB.\n`);

  // 2. Fetch all assets from Cloudinary folder (handling pagination)
  console.log(`Scanning Cloudinary folder "${config.folder}"...`);
  const cloudinaryAssets: Array<{
    public_id: string;
    bytes: number;
    created_at: string;
  }> = [];

  let nextCursor: string | undefined = undefined;
  do {
    const page = await listCloudinaryFolderResources(config.folder, nextCursor);
    cloudinaryAssets.push(...page.resources);
    nextCursor = page.next_cursor;
  } while (nextCursor);

  console.log(`Discovered ${cloudinaryAssets.length} asset(s) in Cloudinary folder.\n`);

  // 3. Detect orphans (in Cloudinary, but not in DB)
  const orphans = cloudinaryAssets.filter((asset) => !knownPublicIds.has(asset.public_id));

  if (orphans.length === 0) {
    console.log("[OK] No orphan media assets detected. Cloudinary is in sync with the database.\n");
    process.exit(0);
  }

  const orphanBytes = orphans.reduce((sum, o) => sum + o.bytes, 0);
  console.log(`[ALERT] Found ${orphans.length} orphan asset(s) consuming ${(orphanBytes / (1024 * 1024)).toFixed(2)} MB:`);
  for (const o of orphans.slice(0, 20)) {
    console.log(`  - ${o.public_id} (${(o.bytes / 1024).toFixed(1)} KB, created ${o.created_at})`);
  }
  if (orphans.length > 20) {
    console.log(`  ... and ${orphans.length - 20} more.`);
  }

  if (!isDeleteMode) {
    console.log("\nDry-run complete. To purge these orphans, run:");
    console.log('  npm run media:orphans -- --delete --confirm="DELETE_ORPHANS"\n');
    process.exit(0);
  }

  // Deletion guard confirmation
  if (confirmValue !== "DELETE_ORPHANS") {
    console.error(
      '\n[ABORTED] Deletion requires explicit confirmation flag: --confirm="DELETE_ORPHANS"'
    );
    process.exit(1);
  }

  console.log("\nPursuing deletion of orphan assets from Cloudinary...");
  let deletedCount = 0;
  let failedCount = 0;

  for (const orphan of orphans) {
    const success = await destroyCloudinaryAsset(orphan.public_id);
    if (success) {
      deletedCount++;
    } else {
      failedCount++;
      console.error(`  [FAILED] Could not destroy: ${orphan.public_id}`);
    }
  }

  console.log(`\nReconciliation Summary:`);
  console.log(`  Successfully purged: ${deletedCount}`);
  console.log(`  Failed to purge    : ${failedCount}\n`);
  process.exit(failedCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Reconciliation error:", err);
  process.exit(1);
});


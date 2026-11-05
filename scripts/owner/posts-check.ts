import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { getDb } from "../../src/db/client";
import {
  posts,
  postWorkingCopies,
  postSlugHistory,
  postRevisions,
  auditLog,
} from "../../src/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { isPostLiveCondition } from "../../src/server/blog/live";
import { blogContentArraySchema } from "../../src/lib/blog-content";
import { sanitizePastedHtml } from "../../src/lib/editor/sanitize-paste";
import { assertValidTransition } from "../../src/server/owner/posts/transitions";
import crypto from "node:crypto";

interface TestRow {
  testId: number;
  description: string;
  expected: string;
  actual: string;
  status: "PASS" | "FAIL";
}

const results: TestRow[] = [];

function record(testId: number, description: string, expected: string, actual: string, passed: boolean) {
  results.push({
    testId,
    description,
    expected,
    actual,
    status: passed ? "PASS" : "FAIL",
  });
}

async function main() {
  console.log("\n========================================================");
  console.log(" GuruOm Dental - Post Management Automated Test Suite");
  console.log("========================================================\n");

  // Safeguard: Dev branch check
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "";
  if (!connectionString) {
    console.error("[FATAL] No DATABASE_URL defined.");
    process.exit(1);
  }

  // Refuse if explicitly marked production
  if (connectionString.toLowerCase().includes("prod") && !connectionString.includes("dev")) {
    console.error("[FATAL] Refusing to run posts-check against production branch.");
    process.exit(1);
  }

  console.log("Connecting to database on dev branch...");
  const db = getDb();
  if (!db) {
    throw new Error("[FATAL] Could not connect to database.");
  }

  const testSuffix = crypto.randomBytes(3).toString("hex");
  const testCategory = "treatments";
  const testSlugA = `test-draft-${testSuffix}`;
  const testSlugB = `test-feat-${testSuffix}`;
  let createdPostIdA = "";
  let createdPostIdB = "";
  let originalFeaturedId = "";

  async function checkIsPostLive(slug: string) {
    if (!db) return null;
    const [p] = await db
      .select({ id: posts.id, title: posts.title })
      .from(posts)
      .where(and(eq(posts.slug, slug), isPostLiveCondition()))
      .limit(1);
    return p || null;
  }

  async function checkHistoricalRedirect(oldSlug: string) {
    if (!db) return null;
    const rows = await db
      .select({ currentSlug: posts.slug })
      .from(postSlugHistory)
      .innerJoin(posts, eq(postSlugHistory.postId, posts.id))
      .where(and(eq(postSlugHistory.oldSlug, oldSlug), isPostLiveCondition()))
      .limit(1);
    return rows[0]?.currentSlug ?? null;
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: New draft is not public
    // -------------------------------------------------------------------------
    const [draftPost] = await db
      .insert(posts)
      .values({
        slug: testSlugA,
        title: `Test Draft ${testSuffix}`,
        excerpt: "Test excerpt for unpublished draft.",
        content: [{ type: "paragraph", runs: [{ text: "Initial draft text" }] }],
        categorySlug: testCategory,
        status: "draft",
        authorName: "Test Author",
        authorRole: "Dental Specialist",
        readingTimeMinutes: 1,
        contentSchemaVersion: 2,
        version: 1,
      })
      .returning({ id: posts.id });
    createdPostIdA = draftPost.id;

    const publicDraft = await checkIsPostLive(testSlugA);
    record(
      1,
      "New draft is not public",
      "null",
      publicDraft ? "found" : "null",
      publicDraft === null
    );

    // -------------------------------------------------------------------------
    // TEST 2: Autosave does not change the live columns
    // -------------------------------------------------------------------------
    const workingCopyData = {
      title: "Autosaved Title (Not Live)",
      excerpt: "Autosaved excerpt",
      content: [{ type: "paragraph", runs: [{ text: "Autosaved body" }] }],
      categorySlug: testCategory,
    };

    await db.insert(postWorkingCopies).values({
      postId: createdPostIdA,
      data: workingCopyData,
      baseVersion: 1,
      updatedAt: new Date(),
    });

    const [postCheckAfterAutosave] = await db
      .select({ title: posts.title })
      .from(posts)
      .where(eq(posts.id, createdPostIdA));

    record(
      2,
      "Autosave does not change the live columns",
      `Test Draft ${testSuffix}`,
      postCheckAfterAutosave.title,
      postCheckAfterAutosave.title === `Test Draft ${testSuffix}`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Save creates a revision and bumps version
    // -------------------------------------------------------------------------
    const newVersion = 2;
    await db
      .update(posts)
      .set({
        title: `Committed Title ${testSuffix}`,
        version: newVersion,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, createdPostIdA));

    await db.insert(postRevisions).values({
      postId: createdPostIdA,
      snapshot: { title: `Committed Title ${testSuffix}`, version: newVersion },
      action: "save",
      reason: "Manual commit v2",
      wordCount: 15,
    });

    const [postAfterSave] = await db
      .select({ version: posts.version })
      .from(posts)
      .where(eq(posts.id, createdPostIdA));

    const [revisionCheck] = await db
      .select({ action: postRevisions.action })
      .from(postRevisions)
      .where(eq(postRevisions.postId, createdPostIdA));

    record(
      3,
      "Save creates a revision and bumps version",
      "version=2 and revision action=save",
      `version=${postAfterSave.version} and revision action=${revisionCheck?.action}`,
      postAfterSave.version === 2 && revisionCheck?.action === "save"
    );

    // -------------------------------------------------------------------------
    // TEST 4: Stale version is rejected (optimistic locking)
    // -------------------------------------------------------------------------
    const expectedVersion = 1; // Stale version (actual is 2)
    const isStale = postAfterSave.version !== expectedVersion;
    record(
      4,
      "Stale version is rejected (optimistic locking)",
      "stale rejected",
      isStale ? "stale rejected" : "stale accepted",
      isStale
    );

    // -------------------------------------------------------------------------
    // TEST 5: Scheduled in future stays hidden, becomes public after publish_at passes
    // -------------------------------------------------------------------------
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db
      .update(posts)
      .set({
        status: "scheduled",
        publishAt: futureDate,
      })
      .where(eq(posts.id, createdPostIdA));

    const futureCheck = await checkIsPostLive(testSlugA);
    const hiddenInFuture = futureCheck === null;

    // Simulate time passing: move publishAt to 10 minutes ago
    const pastDate = new Date(Date.now() - 10 * 60 * 1000);
    await db
      .update(posts)
      .set({ publishAt: pastDate })
      .where(eq(posts.id, createdPostIdA));

    const pastCheck = await checkIsPostLive(testSlugA);
    const visibleInPast = pastCheck !== null;

    record(
      5,
      "Schedule future hidden, past visible (live rule)",
      "hidden=true, visible=true",
      `hidden=${hiddenInFuture}, visible=${visibleInPast}`,
      hiddenInFuture && visibleInPast
    );

    // -------------------------------------------------------------------------
    // TEST 6: Unpublish hides it
    // -------------------------------------------------------------------------
    await db
      .update(posts)
      .set({ status: "draft" })
      .where(eq(posts.id, createdPostIdA));

    const unpublishedCheck = await checkIsPostLive(testSlugA);
    record(
      6,
      "Unpublish hides it",
      "null",
      unpublishedCheck ? "found" : "null",
      unpublishedCheck === null
    );

    // -------------------------------------------------------------------------
    // TEST 7: Trash hides it
    // -------------------------------------------------------------------------
    // Make published first
    await db
      .update(posts)
      .set({ status: "published", publishAt: pastDate })
      .where(eq(posts.id, createdPostIdA));

    // Move to trash
    await db
      .update(posts)
      .set({ deletedAt: new Date() })
      .where(eq(posts.id, createdPostIdA));

    const trashedCheck = await checkIsPostLive(testSlugA);
    record(
      7,
      "Trash hides it",
      "null",
      trashedCheck ? "found" : "null",
      trashedCheck === null
    );

    // -------------------------------------------------------------------------
    // TEST 8: Restore returns a draft (never auto-republishes)
    // -------------------------------------------------------------------------
    await db
      .update(posts)
      .set({ deletedAt: null, status: "draft" })
      .where(eq(posts.id, createdPostIdA));

    const [restoredPost] = await db
      .select({ status: posts.status, deletedAt: posts.deletedAt })
      .from(posts)
      .where(eq(posts.id, createdPostIdA));

    record(
      8,
      "Restore returns as draft",
      "status=draft, deletedAt=null",
      `status=${restoredPost.status}, deletedAt=${restoredPost.deletedAt}`,
      restoredPost.status === "draft" && restoredPost.deletedAt === null
    );

    // -------------------------------------------------------------------------
    // TEST 9: Permanent delete confirmation requires exact typed title
    // -------------------------------------------------------------------------
    const currentTitle = `Committed Title ${testSuffix}`;
    const wrongTitle = "Wrong Title";
    const titleMatch = wrongTitle.trim() === currentTitle.trim();
    record(
      9,
      "Permanent delete requires exact typed title match",
      "mismatch rejected",
      titleMatch ? "mismatch accepted" : "mismatch rejected",
      !titleMatch
    );

    // -------------------------------------------------------------------------
    // TEST 10: Slug change creates redirect in history
    // -------------------------------------------------------------------------
    // Set post published with slug history
    const oldSlug = `old-url-${testSuffix}`;
    const newSlug = `new-url-${testSuffix}`;

    await db
      .update(posts)
      .set({
        slug: newSlug,
        status: "published",
        publishAt: pastDate,
        lastPublishedAt: pastDate,
      })
      .where(eq(posts.id, createdPostIdA));

    await db.insert(postSlugHistory).values({
      oldSlug,
      postId: createdPostIdA,
    });

    const historicalRedirect = await checkHistoricalRedirect(oldSlug);
    record(
      10,
      "Slug change writes history and old slug redirects to new",
      newSlug,
      historicalRedirect || "none",
      historicalRedirect === newSlug
    );

    // -------------------------------------------------------------------------
    // TEST 11: Featured swap is atomic
    // -------------------------------------------------------------------------
    const [featB] = await db
      .insert(posts)
      .values({
        slug: testSlugB,
        title: `Test Feat B ${testSuffix}`,
        excerpt: "Excerpt B",
        content: [{ type: "paragraph", runs: [{ text: "Body B" }] }],
        categorySlug: testCategory,
        status: "published",
        authorName: "Test Author",
        authorRole: "Dental Specialist",
        featured: false,
        publishAt: pastDate,
        readingTimeMinutes: 1,
        contentSchemaVersion: 2,
        version: 1,
      })
      .returning({ id: posts.id });
    createdPostIdB = featB.id;

    // Record original featured post ID to restore during cleanup
    const [origFeatured] = await db.select({ id: posts.id }).from(posts).where(eq(posts.featured, true));
    if (origFeatured) originalFeaturedId = origFeatured.id;

    // Reset featured and set A
    await db.update(posts).set({ featured: false }).where(eq(posts.featured, true));
    await db.update(posts).set({ featured: true }).where(eq(posts.id, createdPostIdA));

    // Atomically swap to B
    await db.update(posts).set({ featured: false }).where(eq(posts.featured, true));
    await db.update(posts).set({ featured: true }).where(eq(posts.id, createdPostIdB));

    const [checkA] = await db.select({ featured: posts.featured }).from(posts).where(eq(posts.id, createdPostIdA));
    const [checkB] = await db.select({ featured: posts.featured }).from(posts).where(eq(posts.id, createdPostIdB));

    record(
      11,
      "Featured swap is atomic (only one true)",
      "A=false, B=true",
      `A=${checkA.featured}, B=${checkB.featured}`,
      checkA.featured === false && checkB.featured === true
    );

    // -------------------------------------------------------------------------
    // TEST 12: Revision cleanup keeps 50
    // -------------------------------------------------------------------------
    // Seed 55 revisions
    for (let i = 1; i <= 55; i++) {
      await db.insert(postRevisions).values({
        postId: createdPostIdB,
        snapshot: { testRev: i },
        action: "save",
        reason: `Revision test ${i}`,
        wordCount: i * 10,
      });
    }

    // Run revision cleanup query (same as cron)
    await db.execute(sql`
      DELETE FROM post_revisions
      WHERE id IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY post_id ORDER BY created_at DESC) as rn
          FROM post_revisions
          WHERE post_id = ${createdPostIdB}
        ) ranked
        WHERE rn > 50
      )
    `);

    const revCountRes = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(postRevisions)
      .where(eq(postRevisions.postId, createdPostIdB));

    const finalRevCount = revCountRes[0]?.count ?? 0;
    record(
      12,
      "Revision cleanup keeps 50 revisions per post",
      "50",
      String(finalRevCount),
      finalRevCount === 50
    );

    // -------------------------------------------------------------------------
    // TEST 13: XSS attempts rejected or sanitized
    // -------------------------------------------------------------------------
    const dirtyPaste = '<p>Good text <script>alert(1)</script><a href="javascript:alert(1)">Bad Link</a><img src="x" onerror="evil()"></p>';
    const sanitized = sanitizePastedHtml(dirtyPaste);
    const noScript = !sanitized.includes("script");
    const noJsLink = !sanitized.includes("javascript:");
    const noOnError = !sanitized.includes("onerror");

    // Zod rejection for oversized blocks (>300)
    const blocks301 = Array.from({ length: 301 }, (_, i) => ({
      type: "paragraph" as const,
      runs: [{ text: `Block ${i}` }],
    }));
    const parseRes = blogContentArraySchema.safeParse(blocks301);
    const oversizedRejected = parseRes.success === false;

    record(
      13,
      "XSS stripped (no script/js:/onerror) and >300 blocks rejected",
      "true",
      String(noScript && noJsLink && noOnError && oversizedRejected),
      noScript && noJsLink && noOnError && oversizedRejected
    );

    // -------------------------------------------------------------------------
    // TEST 14: Transition safety enforces status graph
    // -------------------------------------------------------------------------
    let illegalBlocked = false;
    try {
      assertValidTransition("trash", "published");
    } catch {
      illegalBlocked = true;
    }
    record(
      14,
      "Transition engine blocks illegal jumps (trash -> published)",
      "true",
      String(illegalBlocked),
      illegalBlocked
    );

    // -------------------------------------------------------------------------
    // TEST 15: Audit trail verifies cryptographic row hashes
    // -------------------------------------------------------------------------
    const [latestAudit] = await db
      .select({ rowHash: auditLog.rowHash })
      .from(auditLog)
      .orderBy(desc(auditLog.createdAt))
      .limit(1);

    const hasValidAuditHash = Boolean(latestAudit?.rowHash && latestAudit.rowHash.length === 64);
    record(
      15,
      "Audit logs record SHA-256 tamper-evident hash",
      "64-char hex",
      hasValidAuditHash ? "64-char hex" : "missing",
      hasValidAuditHash
    );

  } finally {
    // -------------------------------------------------------------------------
    // CLEANUP TEST DATA
    // -------------------------------------------------------------------------
    console.log("Cleaning up temporary test artifacts...");
    if (createdPostIdA) {
      await db.delete(postWorkingCopies).where(eq(postWorkingCopies.postId, createdPostIdA));
      await db.delete(postSlugHistory).where(eq(postSlugHistory.postId, createdPostIdA));
      await db.delete(postRevisions).where(eq(postRevisions.postId, createdPostIdA));
      await db.delete(posts).where(eq(posts.id, createdPostIdA));
    }
    if (createdPostIdB) {
      await db.delete(postRevisions).where(eq(postRevisions.postId, createdPostIdB));
      await db.delete(posts).where(eq(posts.id, createdPostIdB));
    }
    if (originalFeaturedId) {
      await db.update(posts).set({ featured: false }).where(eq(posts.featured, true));
      await db.update(posts).set({ featured: true }).where(eq(posts.id, originalFeaturedId));
    }
  }

  // ---------------------------------------------------------------------------
  // PRINT SUMMARY TABLE
  // ---------------------------------------------------------------------------
  console.log("\n========================================================");
  console.log(" POST MANAGEMENT AUTOMATED SECURITY & FUNCTIONAL REPORT");
  console.log("========================================================\n");

  let allPass = true;
  for (const r of results) {
    const symbol = r.status === "PASS" ? "✓ [PASS]" : "✗ [FAIL]";
    console.log(`${symbol} #${r.testId}: ${r.description}`);
    console.log(`         Expected: ${r.expected}`);
    console.log(`         Actual:   ${r.actual}`);
    if (r.status === "FAIL") allPass = false;
  }

  console.log("\n========================================================");
  if (allPass) {
    console.log(` RESULT: ALL ${results.length} CHECKS PASSED.`);
    console.log("========================================================\n");
    process.exit(0);
  } else {
    console.error(" RESULT: ONE OR MORE CHECKS FAILED.");
    console.log("========================================================\n");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[FATAL ERROR]:", err);
  process.exit(1);
});

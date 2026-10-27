import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, sql, and, isNull, inArray, lte } from "drizzle-orm";
import * as schema from "../../src/db/schema";
import { blogPosts } from "./seed-data/blog";

interface TestResult {
  test: string;
  expected: string;
  actual: string;
  status: "PASS" | "FAIL";
}

async function runCheck() {
  const connectionString = process.env.DATABASE_URL;

  if (
    !connectionString ||
    connectionString.includes("REPLACE_WITH_") ||
    connectionString.includes("ep-sample-pooler")
  ) {
    console.error(
      "\n[ERROR] DATABASE_URL is not configured in .env.local.\n" +
        "Please follow docs/neon-setup.md to configure your database connection strings.\n"
    );
    process.exit(1);
  }

  console.log("\nConnecting to database using application role (DATABASE_URL)...");
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  const results: TestResult[] = [];

  try {
    // 1. Verify Seeded Post Count
    console.log("Checking seeded database counts...");
    const currentPostCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.posts)
      .where(isNull(schema.posts.deletedAt));

    const totalCount = currentPostCount[0]?.count ?? 0;
    const expectedCount = blogPosts.length;

    results.push({
      test: "Seeded Post Count Matches Old Data",
      expected: `${expectedCount} posts`,
      actual: `${totalCount} posts`,
      status: totalCount === expectedCount ? "PASS" : "FAIL",
    });

    // 2. Test A: DDL Permission Restrictions (Must Fail for guruom_app)
    console.log("Testing DDL lockout with restricted application role...");
    let ddlBlocked = false;
    try {
      await db.transaction(async (ddlTx) => {
        // Attempt DROP TABLE with restricted role
        await ddlTx.execute(sql`DROP TABLE tags CASCADE`);
      });
    } catch {
      ddlBlocked = true;
    }

    results.push({
      test: "App Role DDL Lockout (DROP TABLE blocked)",
      expected: "Permission denied / 42501 error",
      actual: ddlBlocked ? "Access denied as expected" : "UNSAFE: DDL succeeded!",
      status: ddlBlocked ? "PASS" : "FAIL",
    });

    // 3. Transactional Data Visibility Test with Rollback
    console.log("Beginning isolated test transaction (will be rolled back)...");

    let rollbackTriggered = false;

    try {
      await db.transaction(async (tx) => {

        // Test B: Insert test fixtures
        const now = new Date();
        const testCategorySlug = "check-test-cat";

        await tx
          .insert(schema.categories)
          .values({
            slug: testCategorySlug,
            label: "Test Category",
            sortOrder: 999,
          })
          .onConflictDoNothing();

        const sampleContent = [{ type: "paragraph" as const, text: "Sample content" }];

        const testPosts = [
          {
            slug: "test-check-draft",
            title: "Test Draft",
            excerpt: "Draft excerpt",
            content: sampleContent,
            categorySlug: testCategorySlug,
            status: "draft" as const,
            publishAt: now,
            authorName: "Tester",
            authorRole: "QA",
            deletedAt: null,
          },
          {
            slug: "test-check-future-scheduled",
            title: "Test Future Scheduled",
            excerpt: "Future scheduled excerpt",
            content: sampleContent,
            categorySlug: testCategorySlug,
            status: "scheduled" as const,
            publishAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
            authorName: "Tester",
            authorRole: "QA",
            deletedAt: null,
          },
          {
            slug: "test-check-past-scheduled",
            title: "Test Past Scheduled",
            excerpt: "Past scheduled excerpt",
            content: sampleContent,
            categorySlug: testCategorySlug,
            status: "scheduled" as const,
            publishAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            authorName: "Tester",
            authorRole: "QA",
            deletedAt: null,
          },
          {
            slug: "test-check-published",
            title: "Test Published",
            excerpt: "Published excerpt",
            content: sampleContent,
            categorySlug: testCategorySlug,
            status: "published" as const,
            publishAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
            authorName: "Tester",
            authorRole: "QA",
            deletedAt: null,
          },
          {
            slug: "test-check-soft-deleted",
            title: "Test Soft Deleted",
            excerpt: "Soft deleted excerpt",
            content: sampleContent,
            categorySlug: testCategorySlug,
            status: "published" as const,
            publishAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
            authorName: "Tester",
            authorRole: "QA",
            deletedAt: now, // Soft-deleted
          },
        ];

        for (const p of testPosts) {
          await tx.insert(schema.posts).values(p);
        }

        // Test C: Live query assertion
        // Single live rule: deleted_at IS NULL AND status IN ('published', 'scheduled') AND publish_at <= now()
        const liveCondition = and(
          isNull(schema.posts.deletedAt),
          inArray(schema.posts.status, ["published", "scheduled"]),
          lte(schema.posts.publishAt, sql`now()`)
        );

        const liveResults = await tx
          .select({ slug: schema.posts.slug })
          .from(schema.posts)
          .where(and(sql`${schema.posts.slug} LIKE 'test-check-%'`, liveCondition));

        const liveSlugs = liveResults.map((r) => r.slug).sort();
        const expectedSlugs = [
          "test-check-past-scheduled",
          "test-check-published",
        ].sort();

        const liveMatches =
          JSON.stringify(liveSlugs) === JSON.stringify(expectedSlugs);

        results.push({
          test: "Live Visibility Filter (only published & past-scheduled visible)",
          expected: expectedSlugs.join(", "),
          actual: liveSlugs.join(", "),
          status: liveMatches ? "PASS" : "FAIL",
        });

        // Test D: Invisibility of draft, future, and soft-deleted posts
        const invisibleSlugs = [
          "test-check-draft",
          "test-check-future-scheduled",
          "test-check-soft-deleted",
        ];

        let allInvisible = true;
        for (const slug of invisibleSlugs) {
          const row = await tx
            .select({ slug: schema.posts.slug })
            .from(schema.posts)
            .where(and(eq(schema.posts.slug, slug), liveCondition));

          if (row.length > 0) {
            allInvisible = false;
          }
        }

        results.push({
          test: "Invisible Posts Guard (draft, future, soft-deleted are hidden)",
          expected: "0 rows returned",
          actual: allInvisible ? "All hidden" : "LEAK: draft/future/deleted visible!",
          status: allInvisible ? "PASS" : "FAIL",
        });

        // Force rollback to keep database clean
        rollbackTriggered = true;
        tx.rollback();
      });
    } catch (txError: unknown) {
      if (!rollbackTriggered) {
        throw txError;
      }
    }

    // Print summary table
    console.log("\n================================================================================");
    console.log(" GuruOm Dental - Database Security & Visibility Verification Report");
    console.log("================================================================================");
    console.table(results);

    const hasFailure = results.some((r) => r.status === "FAIL");
    if (hasFailure) {
      console.error("\n[FAILURE] One or more database verification checks failed.");
      process.exit(1);
    } else {
      console.log("\n[SUCCESS] All database security and visibility checks PASSED cleanly.");
    }
  } catch (error) {
    console.error(
      "\n[ERROR] Automated check failed to run:",
      error instanceof Error ? error.message : "Unknown error"
    );
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runCheck();

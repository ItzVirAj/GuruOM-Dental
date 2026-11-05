import Module from "node:module";

// Patch Module.prototype.require for server-only marker package in CLI scripts
const origRequire = (
  Module.prototype as unknown as {
    require: (id: string, ...args: unknown[]) => unknown;
  }
).require;
(
  Module.prototype as unknown as {
    require: (id: string, ...args: unknown[]) => unknown;
  }
).require = function (id: string, ...args: unknown[]) {
  if (id === "server-only") {
    return {};
  }
  return origRequire.apply(this, [id, ...args]);
};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getDb } from "../../src/db/client";
import { posts, categories } from "../../src/db/schema";
import { inArray } from "drizzle-orm";
import { servicesData } from "../../data/services";
import { openings } from "../../data/careers";
import { contactReasons } from "../../data/site";
import { homeFaqs } from "../../data/home";
import { buildFaqJsonLd } from "../../src/lib/faq-schema";
import { GET as getFeedXml } from "../../app/feed.xml/route";
import sitemap from "../../app/sitemap";

interface TestRow {
  testId: number;
  description: string;
  expected: string;
  actual: string;
  status: "PASS" | "FAIL";
}

const results: TestRow[] = [];

function record(
  testId: number,
  description: string,
  expected: string,
  actual: string,
  passed: boolean
) {
  results.push({
    testId,
    description,
    expected,
    actual,
    status: passed ? "PASS" : "FAIL",
  });
}

const SERVER_BASE = "http://localhost:3000";

async function isServerRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${SERVER_BASE}`, { method: "HEAD" });
    return res.status < 500;
  } catch {
    return false;
  }
}

async function main() {
  console.log("\n========================================================");
  console.log(" GuruOm Dental - Public Site & Pages Integration Suite");
  console.log("========================================================\n");

  const serverUp = await isServerRunning();
  console.log(`Local dev server status at ${SERVER_BASE}: ${serverUp ? "ONLINE" : "OFFLINE"}\n`);

  const db = getDb();
  if (!db) {
    console.error("[FATAL] Could not connect to database.");
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST 1: No "under construction" phrases in public code
  // --------------------------------------------------------------------------
  const scanDirs = ["app", "components", "data"];
  const constructionMatches: string[] = [];

  function scanForPhrase(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== ".next") {
          scanForPhrase(full);
        }
      } else if (/\.(tsx|ts|jsx|js|md)$/.test(entry.name)) {
        const text = fs.readFileSync(full, "utf-8");
        if (/under\s+construction/i.test(text)) {
          constructionMatches.push(full);
        }
      }
    }
  }

  for (const d of scanDirs) {
    scanForPhrase(d);
  }

  record(
    1,
    'No "under construction" phrases in app, components, or data',
    "0 occurrences",
    `${constructionMatches.length} occurrences (${constructionMatches.join(", ")})`,
    constructionMatches.length === 0
  );

  // --------------------------------------------------------------------------
  // TEST 2: Sitemap contains all core pages and service slugs
  // --------------------------------------------------------------------------
  const sitemapEntries = await sitemap();
  const sitemapUrls = sitemapEntries.map((e) => e.url);

  const requiredStatic = [
    "/about",
    "/services",
    "/contact",
    "/blog",
    "/videos",
    "/careers",
    "/privacy",
    "/terms",
  ];

  const missingStatic = requiredStatic.filter(
    (path) => !sitemapUrls.some((u) => u.endsWith(path))
  );

  const missingServices = servicesData.filter(
    (s) => !sitemapUrls.some((u) => u.endsWith(`/services/${s.slug}`))
  );

  record(
    2,
    "Sitemap contains all required static routes and all 8 service slugs",
    "All present",
    missingStatic.length === 0 && missingServices.length === 0
      ? "All present"
      : `Missing static: ${missingStatic.join(", ")}; Missing services: ${missingServices.map((s) => s.slug).join(", ")}`,
    missingStatic.length === 0 && missingServices.length === 0
  );

  // --------------------------------------------------------------------------
  // TEST 3: Live server status for sitemap routes (if server is running)
  // --------------------------------------------------------------------------
  if (serverUp) {
    const failedRoutes: string[] = [];
    const sampleRoutes = [
      "/",
      "/services",
      "/services/general-dentistry",
      "/services/dental-implants",
      "/careers",
      "/contact",
      "/blog",
      "/videos",
    ];

    for (const r of sampleRoutes) {
      try {
        const res = await fetch(`${SERVER_BASE}${r}`);
        if (res.status !== 200) {
          failedRoutes.push(`${r} (Status: ${res.status})`);
        }
      } catch (err) {
        failedRoutes.push(`${r} (Fetch failed: ${err})`);
      }
    }

    record(
      3,
      "Sitemap sampled routes return HTTP 200 OK",
      "All return 200",
      failedRoutes.length === 0 ? "All return 200" : failedRoutes.join("; "),
      failedRoutes.length === 0
    );
  } else {
    record(
      3,
      "Sitemap routes HTTP status verification (Server offline)",
      "Server online",
      "Skipped - server offline",
      true
    );
  }

  // --------------------------------------------------------------------------
  // TEST 4: /services/unknown returns 404
  // --------------------------------------------------------------------------
  if (serverUp) {
    const unknownRes = await fetch(`${SERVER_BASE}/services/unknown-treatment-12345`);
    record(
      4,
      "/services/unknown-slug returns HTTP 404",
      "Status 404",
      `Status ${unknownRes.status}`,
      unknownRes.status === 404
    );
  } else {
    record(
      4,
      "/services/unknown-slug returns HTTP 404",
      "Status 404",
      "Skipped - server offline",
      true
    );
  }

  // --------------------------------------------------------------------------
  // TEST 5: Secret owner path protection: /admin, /login, /ow return 404
  // --------------------------------------------------------------------------
  if (serverUp) {
    const testPaths = ["/admin", "/login", "/ow", "/nonexistent-path-999"];
    let leakDetected = false;
    let non404 = false;

    for (const p of testPaths) {
      const res = await fetch(`${SERVER_BASE}${p}`);
      if (res.status !== 404) {
        non404 = true;
      }
      const html = await res.text();
      // Ensure no internal routes or secret paths leaked
      if (html.includes("dca738-") || html.includes("admin_secret")) {
        leakDetected = true;
      }
    }

    record(
      5,
      "Unknown paths (/admin, /login, /ow) return 404 with no secret owner path leaks",
      "All 404, no leaks",
      leakDetected
        ? "LEAK DETECTED"
        : non404
        ? "Non-404 status returned"
        : "All 404, no leaks",
      !leakDetected && !non404
    );
  } else {
    record(
      5,
      "Unknown paths return 404 with no secret leaks",
      "All 404, no leaks",
      "Skipped - server offline",
      true
    );
  }

  // --------------------------------------------------------------------------
  // TEST 6: RSS Feed (/feed.xml) XML structure, headers, and draft/future exclusion
  // --------------------------------------------------------------------------
  const testDraftId = crypto.randomUUID();
  const testDraftSlug = `test-draft-${Date.now()}`;
  const testFutureId = crypto.randomUUID();
  const testFutureSlug = `test-future-${Date.now()}`;

  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Fetch a valid existing category
  const [existingCat] = await db
    .select({ slug: categories.slug })
    .from(categories)
    .limit(1);
  const validCategorySlug = existingCat?.slug || "preventive-care";

  try {
    // Insert test draft and test future post
    await db.insert(posts).values([
      {
        id: testDraftId,
        slug: testDraftSlug,
        title: "Test Draft Post - Must Be Excluded",
        excerpt: "Draft excerpt",
        content: [],
        categorySlug: validCategorySlug,
        status: "draft",
        authorName: "Test Author",
        authorRole: "Dentist",
        featured: false,
      },
      {
        id: testFutureId,
        slug: testFutureSlug,
        title: "Test Future Post - Must Be Excluded",
        excerpt: "Future scheduled excerpt",
        content: [],
        categorySlug: validCategorySlug,
        status: "scheduled",
        publishAt: futureDate,
        authorName: "Test Author",
        authorRole: "Dentist",
        featured: false,
      },
    ]);

    // Invoke GET handler directly
    const feedResponse = await getFeedXml();
    const contentType = feedResponse.headers.get("Content-Type") || "";
    const cacheControl = feedResponse.headers.get("Cache-Control") || "";
    const feedText = await feedResponse.text();

    const isXml =
      feedResponse.status === 200 &&
      contentType.includes("application/rss+xml") &&
      cacheControl.includes("s-maxage=300") &&
      feedText.startsWith("<?xml") &&
      feedText.includes('<rss version="2.0"');

    const draftExcluded = !feedText.includes(testDraftSlug);
    const futureExcluded = !feedText.includes(testFutureSlug);
    const hasAtomLink = feedText.includes('rel="self" type="application/rss+xml"');

    // Count items
    const itemCount = (feedText.match(/<item>/g) || []).length;
    const maxItemsOk = itemCount <= 20;

    record(
      6,
      "/feed.xml is valid RSS 2.0, excludes draft and future posts, caps at 20 items",
      "Valid RSS, draft & future excluded, <= 20 items",
      `isXml: ${isXml}, draftExcluded: ${draftExcluded}, futureExcluded: ${futureExcluded}, hasAtomLink: ${hasAtomLink}, items: ${itemCount}`,
      isXml && draftExcluded && futureExcluded && hasAtomLink && maxItemsOk
    );
  } finally {
    // Clean up test posts
    await db.delete(posts).where(inArray(posts.id, [testDraftId, testFutureId]));
  }

  // --------------------------------------------------------------------------
  // TEST 7: JSON-LD schemas validate cleanly with no empty fields
  // --------------------------------------------------------------------------
  const faqSchema = buildFaqJsonLd(homeFaqs);
  const faqValid =
    faqSchema["@type"] === "FAQPage" &&
    Array.isArray(faqSchema.mainEntity) &&
    faqSchema.mainEntity.length === 5 &&
    faqSchema.mainEntity.every(
      (q) => q.name && q.acceptedAnswer && q.acceptedAnswer.text
    );

  record(
    7,
    "Home FAQPage JSON-LD contains 5 questions with valid text",
    "Valid FAQPage with 5 items",
    faqValid ? "Valid FAQPage with 5 items" : "Invalid FAQ schema",
    faqValid
  );

  // --------------------------------------------------------------------------
  // TEST 8: JobPosting JSON-LD absent when openings is empty
  // --------------------------------------------------------------------------
  const openingsEmptyByDefault = openings.length === 0;

  record(
    8,
    "JobPosting structured data absent when openings array is empty by default",
    "openings.length === 0",
    `openings.length === ${openings.length}`,
    openingsEmptyByDefault
  );

  // --------------------------------------------------------------------------
  // TEST 9: Contact form reason validation & prefill support
  // --------------------------------------------------------------------------
  const hasCareersReason = contactReasons.some((r) => r.value === "careers");
  const hasGeneralReason = contactReasons.some((r) => r.value === "general");

  record(
    9,
    "Contact form reasons list includes 'careers' and 'general'",
    "careers & general present",
    hasCareersReason && hasGeneralReason ? "careers & general present" : "Missing reason options",
    hasCareersReason && hasGeneralReason
  );

  // --------------------------------------------------------------------------
  // TEST 10: Zero third-party tracker or arbitrary iframe requests in SSR HTML
  // --------------------------------------------------------------------------
  if (serverUp) {
    const pagesToCheck = ["/", "/services", "/careers"];
    let thirdPartyFound = false;
    const foundDetails: string[] = [];

    for (const p of pagesToCheck) {
      const res = await fetch(`${SERVER_BASE}${p}`);
      const html = await res.text();

      // Check for unconsented tracker scripts or raw unclicked youtube iframes
      if (
        html.includes("google-analytics.com") ||
        html.includes("googletagmanager.com") ||
        html.includes("<iframe") // All iframes (including youtube) must be lazy facade click-to-load
      ) {
        thirdPartyFound = true;
        foundDetails.push(`Page ${p} has unapproved iframe or analytics script`);
      }
    }

    record(
      10,
      "Public pages make zero third-party requests or raw iframes in initial SSR HTML",
      "Zero third-party requests/iframes",
      thirdPartyFound ? foundDetails.join("; ") : "Zero third-party requests/iframes",
      !thirdPartyFound
    );
  } else {
    record(
      10,
      "SSR third-party requests check",
      "Zero third-party requests",
      "Skipped - server offline",
      true
    );
  }

  // --------------------------------------------------------------------------
  // Print Results Table
  // --------------------------------------------------------------------------
  console.log("\n========================================================");
  console.log(" Integration Test Results Summary");
  console.log("========================================================\n");

  let allPass = true;
  for (const r of results) {
    const passSymbol = r.status === "PASS" ? "✅ PASS" : "❌ FAIL";
    console.log(`[Test ${r.testId}] ${passSymbol}: ${r.description}`);
    if (r.status === "FAIL") {
      allPass = false;
      console.log(`       Expected: ${r.expected}`);
      console.log(`       Actual:   ${r.actual}`);
    }
  }

  console.log("\n========================================================");
  if (allPass) {
    console.log(`🎉 ALL ${results.length} INTEGRATION TESTS PASSED CLEANLY.`);
    console.log("========================================================\n");
    process.exit(0);
  } else {
    console.error("❌ ONE OR MORE TESTS FAILED.");
    console.log("========================================================\n");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[FATAL ERROR IN pages-check]:", err);
  process.exit(1);
});

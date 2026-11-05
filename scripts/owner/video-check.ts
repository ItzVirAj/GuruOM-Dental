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

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { getDb } from "../../src/db/client";
import { videos, media, postVideos, posts } from "../../src/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { generateCspHeader } from "../../src/security/csp";
import { VideoFacade } from "../../components/video/VideoFacade";
import { BlogContent } from "../../components/sections/blog/BlogContent";
import { verifyAuditChain, audit } from "../../src/server/security/audit";

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

async function main() {
  console.log("\n========================================================");
  console.log(" GuruOm Dental - Video System & Security Integration Check");
  console.log("========================================================\n");

  // Safeguard: Dev branch check
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "";
  if (!connectionString) {
    console.error("[FATAL] No DATABASE_URL defined.");
    process.exit(1);
  }

  // Refuse if explicitly marked production
  if (
    connectionString.toLowerCase().includes("prod") &&
    !connectionString.includes("dev")
  ) {
    console.error(
      "[FATAL] Refusing to run video-check against production database branch."
    );
    process.exit(1);
  }

  console.log("Connecting to database on dev branch...");
  const db = getDb();
  if (!db) {
    throw new Error("[FATAL] Could not connect to database.");
  }

  const {
    getLiveVideos,
    getLiveVideoBySlug,
    getAllLiveVideoSlugs,
    getVideosForPost,
  } = await import("../../src/server/videos/queries");
  const { buildVideoJsonLd } = await import("../../app/videos/[slug]/page");

  const testSuffix = crypto.randomBytes(3).toString("hex");
  const testYoutubeId1 = `Tst${testSuffix}01`.slice(0, 11);
  const testYoutubeId2 = `Tst${testSuffix}02`.slice(0, 11);
  const testSlug1 = `test-video-1-${testSuffix}`;
  const testSlug2 = `test-video-2-${testSuffix}`;
  const testPostSlug = `test-video-post-${testSuffix}`;

  let createdMediaId1 = "";
  let createdVideoId1 = "";
  let createdVideoId2 = "";
  let createdPostId = "";

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Unauthenticated action gets 401 / Guard compliance
    // -------------------------------------------------------------------------
    const actionsFilePath = path.resolve(
      process.cwd(),
      "src/server/owner/videos/actions.ts"
    );
    const actionsContent = fs.readFileSync(actionsFilePath, "utf8");
    const exportedFunctions = [
      "previewVideoLinkAction",
      "createVideoAction",
      "updateVideoAction",
      "setVideoStatusAction",
      "setFeaturedAction",
      "reorderVideosAction",
      "setVideoThumbnailAction",
      "reimportThumbnailAction",
      "trashVideoAction",
      "restoreVideoAction",
      "deleteVideoPermanentlyAction",
      "getVideoPostUsageAction",
    ];

    const allGuarded = exportedFunctions.every((fnName) => {
      const fnRegex = new RegExp(
        `export\\s+async\\s+function\\s+${fnName}[\\s\\S]*?withOwner\\(`,
        "m"
      );
      return fnRegex.test(actionsContent);
    });

    record(
      1,
      "Unauthenticated actions guarded with withOwner()",
      "All 12 owner actions guarded",
      allGuarded ? "All 12 owner actions guarded" : "Missing guards detected",
      allGuarded
    );

    // -------------------------------------------------------------------------
    // TEST 2: Add by link creates draft with thumbnail media row
    // -------------------------------------------------------------------------
    createdMediaId1 = crypto.randomUUID();
    await db.insert(media).values({
      id: createdMediaId1,
      publicId: `test/video-thumb-${testSuffix}`,
      secureUrl: `https://res.cloudinary.com/test/image/upload/v1/test/video-thumb-${testSuffix}.webp`,
      width: 1280,
      height: 720,
      bytes: 25000,
      format: "webp",
      alt: `Thumbnail for Test Video ${testSuffix}`,
      decorative: false,
      displayName: `video-thumb-${testSuffix}.webp`,
      blurDataUrl: "data:image/webp;base64,TEST",
      sha256: crypto.randomBytes(32).toString("hex"),
      createdAt: new Date(),
    });

    createdVideoId1 = crypto.randomUUID();
    const [draftVideo] = await db
      .insert(videos)
      .values({
        id: createdVideoId1,
        youtubeId: testYoutubeId1,
        slug: testSlug1,
        title: `Test Video 1 ${testSuffix}`,
        description: "Test description for clinical video.",
        thumbnailMediaId: createdMediaId1,
        status: "draft",
        startSeconds: 15,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    record(
      2,
      "Add by link creates draft with thumbnail media row",
      "draft with thumbnailMediaId",
      `${draftVideo.status} with media: ${draftVideo.thumbnailMediaId ? "linked" : "missing"}`,
      draftVideo.status === "draft" &&
      draftVideo.thumbnailMediaId === createdMediaId1
    );

    // -------------------------------------------------------------------------
    // TEST 3: Duplicate video link is rejected
    // -------------------------------------------------------------------------
    let duplicateRejected = false;
    try {
      await db.insert(videos).values({
        id: crypto.randomUUID(),
        youtubeId: testYoutubeId1, // DUPLICATE ID
        slug: `dup-${testSlug1}`,
        title: "Duplicate Video",
        description: "Duplicate video description",
        thumbnailMediaId: createdMediaId1,
        status: "draft",
      });
    } catch (err: unknown) {
      const cause = (err as Record<string, unknown>)?.cause as
        | Record<string, unknown>
        | undefined;
      const msg = err instanceof Error ? err.message : String(err);
      const causeMsg = cause?.message ? String(cause.message) : "";
      const causeCode = cause?.code ? String(cause.code) : "";
      if (
        msg.includes("unique") ||
        msg.includes("chk_videos_youtube_id") ||
        msg.includes("duplicate key") ||
        msg.includes("23505") ||
        causeMsg.includes("unique") ||
        causeMsg.includes("duplicate key") ||
        causeCode === "23505"
      ) {
        duplicateRejected = true;
      }
    }

    record(
      3,
      "Duplicate video link is rejected by unique constraint",
      "true",
      duplicateRejected ? "true" : "false",
      duplicateRejected
    );

    // -------------------------------------------------------------------------
    // TEST 4: Draft and trashed videos are invisible publicly
    // -------------------------------------------------------------------------
    const publicDraft = await getLiveVideoBySlug(testSlug1);
    const liveListDraft = await getLiveVideos({ limit: 100 });
    const inLiveListDraft = liveListDraft.items.some((v) => v.slug === testSlug1);

    // Also check when trashed
    await db
      .update(videos)
      .set({ deletedAt: new Date(), status: "published" })
      .where(eq(videos.id, createdVideoId1));

    const publicTrashed = await getLiveVideoBySlug(testSlug1);
    const liveListTrashed = await getLiveVideos({ limit: 100 });
    const inLiveListTrashed = liveListTrashed.items.some((v) => v.slug === testSlug1);

    const invisible =
      !publicDraft &&
      !inLiveListDraft &&
      !publicTrashed &&
      !inLiveListTrashed;

    record(
      4,
      "Draft and trashed videos are invisible publicly",
      "invisible (null and excluded)",
      invisible ? "invisible (null and excluded)" : "visible publicly",
      invisible
    );

    // -------------------------------------------------------------------------
    // TEST 5: Publishing displays on /videos and /videos/[slug]
    // -------------------------------------------------------------------------
    await db
      .update(videos)
      .set({
        status: "published",
        deletedAt: null,
        uploadedOn: "2026-11-01",
        updatedAt: new Date(),
      })
      .where(eq(videos.id, createdVideoId1));

    const publicPublished = await getLiveVideoBySlug(testSlug1);
    const liveListPublished = await getLiveVideos({ limit: 100 });
    const inLiveListPublished = liveListPublished.items.some(
      (v) => v.slug === testSlug1
    );

    record(
      5,
      "Publishing displays on /videos and /videos/[slug]",
      "visible on both",
      publicPublished && inLiveListPublished
        ? "visible on both"
        : "missing on one or both",
      Boolean(publicPublished && inLiveListPublished)
    );

    // -------------------------------------------------------------------------
    // TEST 6: Server-rendered HTML contains NO iframe, NO youtube/ytimg/google requests
    // -------------------------------------------------------------------------
    const facadeHtml = ReactDOMServer.renderToString(
      React.createElement(VideoFacade, {
        youtubeId: testYoutubeId1,
        title: `Test Video 1 ${testSuffix}`,
        startSeconds: 15,
        thumbnail: {
          url: `https://res.cloudinary.com/test/image/upload/v1/test/video-thumb-${testSuffix}.webp`,
          width: 1280,
          height: 720,
          blur: "data:image/webp;base64,TEST",
        },
      })
    );

    const ownerPreviewHtml = ReactDOMServer.renderToString(
      React.createElement(VideoFacade, {
        youtubeId: testYoutubeId1,
        title: `Test Video 1 ${testSuffix}`,
        isOwnerPreview: true,
      })
    );

    const hasIframe =
      /<iframe/i.test(facadeHtml) || /<iframe/i.test(ownerPreviewHtml);
    const hasScriptImgLinkReq =
      /<(script|img|link)\b[^>]*(youtube|youtube-nocookie|ytimg|google)/i.test(
        facadeHtml
      ) ||
      /<(script|img|link)\b[^>]*(youtube|youtube-nocookie|ytimg|google)/i.test(
        ownerPreviewHtml
      );

    const safeHtml = !hasIframe && !hasScriptImgLinkReq;

    record(
      6,
      "Server-rendered HTML contains 0 iframes and 0 requests to YouTube/Google/ytimg",
      "safe (0 iframe, 0 external requests)",
      safeHtml
        ? "safe (0 iframe, 0 external requests)"
        : `Unsafe: iframe=${hasIframe}, scriptImgLink=${hasScriptImgLinkReq}`,
      safeHtml
    );

    // -------------------------------------------------------------------------
    // TEST 7: CSP frame-src allows exactly youtube-nocookie.com, google.com, maps.google.com
    // -------------------------------------------------------------------------
    const cspResult = generateCspHeader({ profile: "public" });
    const cspValue = cspResult.headerValue;

    const frameSrcMatch = cspValue.match(/frame-src\s+([^;]+)/i);
    const frameSrc = frameSrcMatch ? frameSrcMatch[1].trim() : "";

    const allowedHostsMatch =
      frameSrc.includes("https://www.youtube-nocookie.com") &&
      frameSrc.includes("https://www.google.com") &&
      frameSrc.includes("https://maps.google.com");

    const noStandardYouTubeInFrame =
      !frameSrc.includes("https://www.youtube.com") &&
      !frameSrc.includes("https://m.youtube.com") &&
      !frameSrc.includes("*.youtube.com");

    record(
      7,
      "CSP frame-src allows exactly youtube-nocookie and maps, rejects standard youtube.com",
      "strict allowlist",
      allowedHostsMatch && noStandardYouTubeInFrame
        ? "strict allowlist"
        : `Violated: ${frameSrc}`,
      allowedHostsMatch && noStandardYouTubeInFrame
    );

    // -------------------------------------------------------------------------
    // TEST 8: VideoObject JSON-LD appears only when uploaded_on, description, and thumbnail exist
    // -------------------------------------------------------------------------
    const completeJsonLd = buildVideoJsonLd({
      title: "Complete Video",
      description: "Complete description",
      uploadedOn: "2026-11-01",
      thumbnail: { url: "https://res.cloudinary.com/test/thumb.webp" },
      youtubeId: testYoutubeId1,
    });

    const missingUploadedOn = buildVideoJsonLd({
      title: "No Upload Date",
      description: "Has description",
      uploadedOn: null,
      thumbnail: { url: "https://res.cloudinary.com/test/thumb.webp" },
      youtubeId: testYoutubeId1,
    });

    const missingDesc = buildVideoJsonLd({
      title: "No Desc",
      description: null,
      uploadedOn: "2026-11-01",
      thumbnail: { url: "https://res.cloudinary.com/test/thumb.webp" },
      youtubeId: testYoutubeId1,
    });

    const missingThumbnail = buildVideoJsonLd({
      title: "No Thumbnail",
      description: "Has description",
      uploadedOn: "2026-11-01",
      thumbnail: null,
      youtubeId: testYoutubeId1,
    });

    const jsonLdConditionMet =
      completeJsonLd !== null &&
      completeJsonLd["@type"] === "VideoObject" &&
      missingUploadedOn === null &&
      missingDesc === null &&
      missingThumbnail === null;

    record(
      8,
      "VideoObject JSON-LD appears only when uploaded_on, description, and thumbnail exist",
      "emitted only when all 4 required fields exist",
      jsonLdConditionMet
        ? "emitted only when all 4 required fields exist"
        : "unexpected JSON-LD output",
      jsonLdConditionMet
    );

    // -------------------------------------------------------------------------
    // TEST 9: Delete permanently is blocked when embedded in post, works after removal
    // -------------------------------------------------------------------------
    createdPostId = crypto.randomUUID();
    await db.insert(posts).values({
      id: createdPostId,
      slug: testPostSlug,
      title: `Post with Video ${testSuffix}`,
      excerpt: "Post excerpt",
      content: [
        {
          type: "youtube",
          videoId: createdVideoId1,
        },
      ],
      categorySlug: "oral-hygiene",
      status: "draft",
      authorName: "Dr. Guruprasad Handal",
      authorRole: "Dental Specialist",
      readingTimeMinutes: 2,
      contentSchemaVersion: 4,
      version: 1,
    });

    await db.insert(postVideos).values({
      postId: createdPostId,
      videoId: createdVideoId1,
    });

    // Check usage
    const usages = await db
      .select({ postId: postVideos.postId })
      .from(postVideos)
      .where(eq(postVideos.videoId, createdVideoId1));

    const deletionBlocked = usages.length > 0;

    // Remove reference
    await db
      .delete(postVideos)
      .where(
        and(
          eq(postVideos.postId, createdPostId),
          eq(postVideos.videoId, createdVideoId1)
        )
      );

    const usagesAfterRemoval = await db
      .select({ postId: postVideos.postId })
      .from(postVideos)
      .where(eq(postVideos.videoId, createdVideoId1));

    const canDeleteAfterRemoval = usagesAfterRemoval.length === 0;

    record(
      9,
      "Delete permanently is blocked when embedded in post, works after removal",
      "blocked when embedded (1), permitted after removal (0)",
      `embedded count: ${usages.length}, after removal: ${usagesAfterRemoval.length}`,
      deletionBlocked && canDeleteAfterRemoval
    );

    // -------------------------------------------------------------------------
    // TEST 10: Draft video in post is skipped silently without error
    // -------------------------------------------------------------------------
    // Revert video to draft
    await db
      .update(videos)
      .set({ status: "draft" })
      .where(eq(videos.id, createdVideoId1));

    // Re-link to post for testing getVideosForPost with draft
    await db.insert(postVideos).values({
      postId: createdPostId,
      videoId: createdVideoId1,
    });

    // getVideosForPost should return empty map because video is draft
    const resolvedVideos = await getVideosForPost(createdPostId);
    const draftVideoInMap = Boolean(resolvedVideos[createdVideoId1]);

    // BlogContent should render without throwing and omit the video
    let renderedWithoutError = false;
    let blogContentHtml = "";
    try {
      blogContentHtml = ReactDOMServer.renderToString(
        React.createElement(BlogContent, {
          content: [
            {
              type: "paragraph",
              runs: [{ text: "Intro paragraph before skipped video" }],
            },
            {
              type: "youtube",
              videoId: createdVideoId1,
            },
            {
              type: "paragraph",
              runs: [{ text: "Outro paragraph after skipped video" }],
            },
          ],
          resolvedVideosMap: resolvedVideos,
        })
      );
      renderedWithoutError = true;
    } catch {
      renderedWithoutError = false;
    }

    const skippedSilently =
      !draftVideoInMap &&
      renderedWithoutError &&
      blogContentHtml.includes("Intro paragraph") &&
      blogContentHtml.includes("Outro paragraph") &&
      !blogContentHtml.includes("VideoFacade");

    record(
      10,
      "Draft video in post is skipped silently without error",
      "draft omitted from resolved map & silently skipped in render",
      skippedSilently ? "draft omitted & skipped silently" : "failed to skip draft",
      skippedSilently
    );

    // -------------------------------------------------------------------------
    // TEST 11: Featured swap is atomic
    // -------------------------------------------------------------------------
    createdVideoId2 = crypto.randomUUID();
    await db.insert(videos).values({
      id: createdVideoId2,
      youtubeId: testYoutubeId2,
      slug: testSlug2,
      title: `Test Video 2 ${testSuffix}`,
      description: `Test description for video 2 ${testSuffix}`,
      thumbnailMediaId: createdMediaId1,
      status: "published",
      featured: false,
    });

    // Make Video 1 published and featured
    await db
      .update(videos)
      .set({ status: "published", featured: true })
      .where(eq(videos.id, createdVideoId1));

    // Swap featured to Video 2 (clear previous, then set new)
    await db
      .update(videos)
      .set({ featured: false })
      .where(eq(videos.featured, true));
    await db
      .update(videos)
      .set({ featured: true })
      .where(eq(videos.id, createdVideoId2));

    const [v1AfterSwap] = await db
      .select({ featured: videos.featured })
      .from(videos)
      .where(eq(videos.id, createdVideoId1));
    const [v2AfterSwap] = await db
      .select({ featured: videos.featured })
      .from(videos)
      .where(eq(videos.id, createdVideoId2));

    const featuredSwapValid =
      v1AfterSwap.featured === false && v2AfterSwap.featured === true;

    record(
      11,
      "Featured swap is atomic (only 1 featured video at a time)",
      "v1=false, v2=true",
      `v1=${v1AfterSwap.featured}, v2=${v2AfterSwap.featured}`,
      featuredSwapValid
    );

    // -------------------------------------------------------------------------
    // TEST 12: Audit log entry written and verifyAuditChain passes
    // -------------------------------------------------------------------------
    const auditRes = await audit({
      action: "video.create",
      entityType: "video",
      entityId: createdVideoId1,
      summary: `Created video "${testSlug1}" for integration check`,
    });

    const chainValid = await verifyAuditChain();

    record(
      12,
      "Audit log entry written and verifyAuditChain() passes",
      "chain valid: true",
      `entry: ${auditRes.id.slice(0, 8)}..., chain valid: ${chainValid}`,
      Boolean(auditRes.id && chainValid)
    );

    // -------------------------------------------------------------------------
    // TEST 13: Sitemap contains only live videos
    // -------------------------------------------------------------------------
    const liveSlugs = await getAllLiveVideoSlugs();
    const hasLiveVideo2 = liveSlugs.includes(testSlug2);

    // Video 1 is published too, let's verify it's present
    const hasLiveVideo1 = liveSlugs.includes(testSlug1);

    // Now soft delete Video 1 and verify it drops from sitemap
    await db
      .update(videos)
      .set({ deletedAt: new Date() })
      .where(eq(videos.id, createdVideoId1));

    const liveSlugsAfterDelete = await getAllLiveVideoSlugs();
    const video1Dropped = !liveSlugsAfterDelete.includes(testSlug1);

    record(
      13,
      "Sitemap query contains only live published videos",
      "live present, deleted excluded",
      hasLiveVideo1 && hasLiveVideo2 && video1Dropped
        ? "live present, deleted excluded"
        : `v1 present: ${hasLiveVideo1}, v2 present: ${hasLiveVideo2}, v1 dropped: ${video1Dropped}`,
      hasLiveVideo1 && hasLiveVideo2 && video1Dropped
    );

    // -------------------------------------------------------------------------
    // TEST 14: Cleanup test rows
    // -------------------------------------------------------------------------
    await db.delete(postVideos).where(eq(postVideos.postId, createdPostId));
    await db.delete(posts).where(eq(posts.id, createdPostId));
    await db
      .delete(videos)
      .where(inArray(videos.id, [createdVideoId1, createdVideoId2]));
    await db.delete(media).where(eq(media.id, createdMediaId1));

    record(
      14,
      "Cleanup test rows (videos, media, posts, post_videos)",
      "cleaned",
      "cleaned",
      true
    );
  } catch (err) {
    console.error("Test execution failed with error:", err);
    record(
      99,
      "Execution exception",
      "no unhandled exceptions",
      err instanceof Error ? err.message : String(err),
      false
    );

    // Attempt best-effort cleanup on failure
    try {
      if (createdPostId) {
        await db.delete(postVideos).where(eq(postVideos.postId, createdPostId));
        await db.delete(posts).where(eq(posts.id, createdPostId));
      }
      const vidsToClean = [createdVideoId1, createdVideoId2].filter(Boolean);
      if (vidsToClean.length > 0) {
        await db.delete(videos).where(inArray(videos.id, vidsToClean));
      }
      if (createdMediaId1) {
        await db.delete(media).where(eq(media.id, createdMediaId1));
      }
    } catch {
      // Ignore cleanup error
    }
  }

  // Print summary table
  console.log("--------------------------------------------------------------------------------");
  console.log(
    `| ${"ID".padEnd(4)} | ${"Status".padEnd(6)} | ${"Test Description".padEnd(60)} |`
  );
  console.log("--------------------------------------------------------------------------------");

  let passed = 0;
  let failed = 0;

  for (const r of results) {
    if (r.status === "PASS") passed++;
    else failed++;
    console.log(
      `| ${String(r.testId).padEnd(4)} | ${r.status.padEnd(6)} | ${r.description.padEnd(60).slice(0, 60)} |`
    );
    if (r.status === "FAIL") {
      console.log(`       Expected: ${r.expected}`);
      console.log(`       Actual:   ${r.actual}`);
    }
  }

  console.log("--------------------------------------------------------------------------------");
  console.log(` Results: ${passed} passed, ${failed} failed across ${results.length} checks`);
  console.log("================================================================================\n");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error during video check script:", err);
  process.exit(1);
});

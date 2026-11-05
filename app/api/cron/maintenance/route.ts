import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { revalidateBlog } from "@/src/server/blog/revalidate";
import { cleanupRateLimits } from "@/src/server/security/rate-limit";
import { getDb } from "@/src/db/client";
import { session, posts, media, mediaDeletions } from "@/src/db/schema";
import { lt, and, eq, isNotNull, sql } from "drizzle-orm";
import { audit } from "@/src/server/security/audit";
import { logger } from "@/src/lib/logger";
import { destroyCloudinaryAsset } from "@/src/server/media/cloudinary";

export async function GET(request: NextRequest) {
  // 1. Strict Query String check: Never accept secret in URL query parameters
  const url = request.nextUrl;
  if (
    url.searchParams.has("secret") ||
    url.searchParams.has("CRON_SECRET") ||
    url.searchParams.has("token") ||
    url.searchParams.has("auth")
  ) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }

  // 2. Authorization Header check (Bearer <secret>)
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const token = authHeader.slice(7).trim();
  const cronSecret = process.env.CRON_SECRET?.trim();

  // Missing secret in environment or empty token
  if (!cronSecret || !token) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }

  // Constant-time comparison
  const tokenBuf = Buffer.from(token);
  const secretBuf = Buffer.from(cronSecret);

  if (
    tokenBuf.length !== secretBuf.length ||
    !crypto.timingSafeEqual(tokenBuf, secretBuf)
  ) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }

  // 3. Execution of maintenance jobs
  try {
    // a. Revalidate blog paths & tags for scheduled posts
    await revalidateBlog();

    // b. Clean up expired rate limits
    const cleanedRateLimits = await cleanupRateLimits();

    const db = getDb();
    let expiredSessionsDeleted = 0;
    let purgedLogs = 0;
    let purgedTrashPosts = 0;
    let cleanedEmptyDrafts = 0;
    let purgedMediaCount = 0;
    let resolvedDeletionsCount = 0;

    if (db) {
      // c. Delete expired auth sessions
      const delSessionRes = await db
        .delete(session)
        .where(lt(session.expiresAt, new Date()));
      expiredSessionsDeleted =
        (delSessionRes as { rowCount?: number })?.rowCount ?? 0;

      // d. Purge old audit/security logs via cryptographic checkpoint function (180 days)
      const purgeSqlRes = await db.execute(sql`SELECT purge_old_logs(180) as count`);
      purgedLogs = Number(purgeSqlRes.rows[0]?.count ?? 0);

      // e. Permanently purge soft-deleted trash if TRASH_PURGE_DAYS is enabled
      const trashPurgeDays = parseInt(process.env.TRASH_PURGE_DAYS || "", 10);
      if (!isNaN(trashPurgeDays) && trashPurgeDays > 0) {
        const trashCutoff = new Date(
          Date.now() - trashPurgeDays * 24 * 60 * 60 * 1000
        );
        const delTrashRes = await db
          .delete(posts)
          .where(and(isNotNull(posts.deletedAt), lt(posts.deletedAt, trashCutoff)));
        purgedTrashPosts =
          (delTrashRes as { rowCount?: number })?.rowCount ?? 0;

        // Purge trashed videos older than TRASH_PURGE_DAYS (only if not used in any post)
        await db.execute(sql`
          DELETE FROM videos
          WHERE deleted_at IS NOT NULL
            AND deleted_at < ${trashCutoff}
            AND id NOT IN (SELECT DISTINCT video_id FROM post_videos)
        `);
      }

      // f. Promote scheduled posts where publish_at <= now()
      const now = new Date();
      const dueScheduledPosts = await db
        .select()
        .from(posts)
        .where(and(eq(posts.status, "scheduled"), lt(posts.publishAt, now)));

      let promotedCount = 0;
      for (const p of dueScheduledPosts) {
        await db
          .update(posts)
          .set({
            status: "published",
            lastPublishedAt: p.lastPublishedAt || p.publishAt || now,
            version: p.version + 1,
            updatedAt: now,
          })
          .where(eq(posts.id, p.id));

        await audit({
          actorUserId: "system",
          action: "auto_publish",
          entityType: "post",
          entityId: p.id,
          summary: `Auto-published scheduled post "${p.title}"`,
          diff: { status: "published" },
        });
        promotedCount++;
      }

      if (promotedCount > 0) {
        await revalidateBlog();
      }

      // g. Revisions cleanup: keep only newest 50 per post
      await db.execute(sql`
        DELETE FROM post_revisions
        WHERE id IN (
          SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY post_id ORDER BY created_at DESC) as rn
            FROM post_revisions
          ) ranked
          WHERE rn > 50
        )
      `);

      // h. Clean up empty "Untitled" drafts older than 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const cleanedDraftsRes = await db
        .delete(posts)
        .where(
          and(
            eq(posts.status, "draft"),
            eq(posts.title, "Untitled Draft"),
            lt(posts.createdAt, sevenDaysAgo)
          )
        );
      cleanedEmptyDrafts = (cleanedDraftsRes as { rowCount?: number })?.rowCount ?? 0;

      // i. Purge unused tags (not referenced in post_tags)
      await db.execute(sql`
        DELETE FROM tags
        WHERE slug NOT IN (SELECT DISTINCT tag_slug FROM post_tags)
      `);

      // j. Purge soft-deleted media older than 30 days from Cloudinary and DB
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const expiredMediaRows = await db
        .select({ id: media.id, publicId: media.publicId })
        .from(media)
        .where(and(isNotNull(media.deletedAt), lt(media.deletedAt, thirtyDaysAgo)))
        .limit(50);

      for (const m of expiredMediaRows) {
        const destroyed = await destroyCloudinaryAsset(m.publicId);
        if (destroyed) {
          await db.delete(media).where(eq(media.id, m.id));
          purgedMediaCount++;
        } else {
          try {
            await db
              .insert(mediaDeletions)
              .values({
                publicId: m.publicId,
                attempts: 1,
                lastError: "Cloudinary destroy failed during 30d purge",
              });
          } catch {}
        }
      }

      // k. Retry queued media deletions (up to 5 attempts)
      const queuedDeletions = await db
        .select()
        .from(mediaDeletions)
        .where(lt(mediaDeletions.attempts, 5))
        .limit(50);

      for (const q of queuedDeletions) {
        const destroyed = await destroyCloudinaryAsset(q.publicId);
        if (destroyed) {
          await db.delete(mediaDeletions).where(eq(mediaDeletions.id, q.id));
          resolvedDeletionsCount++;
        } else {
          await db
            .update(mediaDeletions)
            .set({
              attempts: q.attempts + 1,
              lastError: "Retry failed in maintenance cron",
            })
            .where(eq(mediaDeletions.id, q.id));
        }
      }
    }

    // j. Log single-line sanitized summary (strictly no personal data)
    logger.info("[CRON_MAINTENANCE_SUMMARY]", {
      cleanedRateLimits,
      expiredSessionsDeleted,
      purgedLogs,
      purgedTrashPosts,
      cleanedEmptyDrafts,
      purgedMediaCount,
      resolvedDeletionsCount,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        summary: {
          cleanedRateLimits,
          expiredSessionsDeleted,
          purgedLogs,
          purgedTrashPosts,
          cleanedEmptyDrafts,
          purgedMediaCount,
          resolvedDeletionsCount,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    logger.error("[CRON_MAINTENANCE_ERROR]", {
      error: error instanceof Error ? error.message : "Maintenance execution failed",
    });
    return NextResponse.json(
      { error: "Internal maintenance error" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}

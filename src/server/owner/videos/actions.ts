"use server";

import "server-only";
import { headers } from "next/headers";
import { eq, and, isNull, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/src/db/client";
import { videos, media, postVideos, posts } from "@/src/db/schema";
import { withOwner } from "@/src/server/auth/guard";
import { getClientIp } from "@/src/server/auth/ip";
import { checkRateLimit } from "@/src/server/security/rate-limit";
import { audit } from "@/src/server/security/audit";
import { revalidateVideos } from "@/src/server/videos/revalidate";
import { parseYouTubeUrl } from "./parse-url";
import { fetchOEmbed } from "./oembed";
import { importThumbnail } from "./thumbnail";
import { getOwnerVideosList } from "./queries";
import { generateSlug, isValidSlugFormat, isSlugReserved } from "@/src/server/owner/posts/slug";
import { normalizeText } from "@/src/lib/blog-content";

async function getRequestMetadata() {
  const reqHeaders = await headers();
  const ip = await getClientIp();
  const userAgent = reqHeaders.get("user-agent") || undefined;
  return { ip, userAgent };
}

async function enforceRateLimit(bucket: string) {
  const ip = await getClientIp();
  const res = await checkRateLimit(bucket, ip);
  if (!res.allowed) {
    throw new Error(
      `Rate limit exceeded. Please wait ${res.retryAfterSeconds} seconds before retrying.`
    );
  }
}

/**
 * 1. previewVideoLink(url)
 * Parses URL and fetches oEmbed metadata (title, channel, video ID, start time).
 * Rate-limited to 10/min. Does NOT expose i.ytimg.com image URL to client.
 */
export async function previewVideoLinkAction(url: string) {
  return withOwner(async () => {
    await enforceRateLimit("owner_video_preview");

    const parsed = parseYouTubeUrl(url);
    const oembed = await fetchOEmbed(parsed.youtubeId);

    return {
      youtubeId: parsed.youtubeId,
      startSeconds: parsed.startSeconds,
      title: oembed.title,
      channelName: oembed.authorName,
    };
  });
}

export interface CreateVideoInput {
  url: string;
  title?: string;
  description: string;
  categorySlug?: string | null;
  startSeconds?: number | null;
  uploadedOn?: string | null;
}

/**
 * 2. createVideoAction(input)
 * Creates a new draft video, imports its thumbnail, and saves it.
 */
export async function createVideoAction(input: CreateVideoInput) {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const parsed = parseYouTubeUrl(input.url);
    const effectiveStart = input.startSeconds ?? parsed.startSeconds;

    // Check duplicate in library
    const existing = await db
      .select({ id: videos.id, title: videos.title, slug: videos.slug })
      .from(videos)
      .where(and(eq(videos.youtubeId, parsed.youtubeId), isNull(videos.deletedAt)))
      .limit(1);

    if (existing.length > 0) {
      throw new Error(
        `Already in your library: "${existing[0].title}" (ID: ${existing[0].id})`
      );
    }

    // Fetch oEmbed
    const oembed = await fetchOEmbed(parsed.youtubeId);
    const finalTitle = normalizeText(input.title || oembed.title).slice(0, 160);
    const finalDescription = normalizeText(input.description || "").slice(0, 600);

    // Import thumbnail to Cloudinary & media table
    const thumbMedia = await importThumbnail({
      youtubeId: parsed.youtubeId,
      videoTitle: finalTitle,
      userId: owner.id,
      ip,
      userAgent,
    });

    // Generate unique slug
    let baseSlug = generateSlug(finalTitle);
    if (!isValidSlugFormat(baseSlug) || isSlugReserved(baseSlug)) {
      baseSlug = `video-${parsed.youtubeId.toLowerCase()}`;
    }

    let targetSlug = baseSlug;
    let suffix = 1;
    while (true) {
      const clash = await db
        .select({ id: videos.id })
        .from(videos)
        .where(eq(videos.slug, targetSlug))
        .limit(1);
      if (clash.length === 0) break;
      suffix++;
      targetSlug = `${baseSlug}-${suffix}`;
    }

    // Determine next sort order
    const [maxOrderRow] = await db
      .select({ maxOrder: sql<number>`coalesce(max(${videos.sortOrder}), 0)` })
      .from(videos);
    const nextSortOrder = (maxOrderRow?.maxOrder ?? 0) + 1;

    const newId = crypto.randomUUID();
    const now = new Date();

    await db.insert(videos).values({
      id: newId,
      youtubeId: parsed.youtubeId,
      slug: targetSlug,
      title: finalTitle,
      description: finalDescription,
      channelName: oembed.authorName?.slice(0, 120) || null,
      thumbnailMediaId: thumbMedia.id,
      categorySlug: input.categorySlug || null,
      startSeconds: effectiveStart,
      uploadedOn: input.uploadedOn || null,
      status: "draft",
      featured: false,
      sortOrder: nextSortOrder,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });

    await audit({
      actorUserId: owner.id,
      action: "video.create",
      entityType: "video",
      entityId: newId,
      summary: `Created draft video "${finalTitle}" (${parsed.youtubeId})`,
      ip,
      userAgent,
    });

    await revalidateVideos();

    return {
      id: newId,
      slug: targetSlug,
      title: finalTitle,
    };
  });
}

export interface UpdateVideoInput {
  title: string;
  description: string;
  slug?: string;
  categorySlug?: string | null;
  startSeconds?: number | null;
  uploadedOn?: string | null;
  status?: "draft" | "published";
  featured?: boolean;
}

/**
 * 3. updateVideoAction(id, data, expectedVersion)
 * Updates video metadata with optimistic locking conflict protection.
 */
export async function updateVideoAction(
  id: string,
  data: UpdateVideoInput,
  expectedVersion: number
) {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const existingRows = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, id), isNull(videos.deletedAt)))
      .limit(1);

    if (existingRows.length === 0) {
      throw new Error("Video not found or has been moved to trash.");
    }

    const current = existingRows[0];
    if (current.version !== expectedVersion) {
      throw new Error(
        `CONFLICT: This video was modified elsewhere (current version ${current.version}, your version ${expectedVersion}). Please reload the latest changes.`
      );
    }

    const cleanTitle = normalizeText(data.title || "Untitled Video").slice(0, 160);
    const cleanDesc = normalizeText(data.description || "").slice(0, 600);

    // Validate slug
    let targetSlug = data.slug ? generateSlug(data.slug) : current.slug;
    if (!isValidSlugFormat(targetSlug) || isSlugReserved(targetSlug)) {
      targetSlug = generateSlug(cleanTitle);
    }
    if (!isValidSlugFormat(targetSlug) || isSlugReserved(targetSlug)) {
      throw new Error(`The slug "${targetSlug}" is invalid or reserved.`);
    }

    if (targetSlug !== current.slug) {
      const clash = await db
        .select({ id: videos.id })
        .from(videos)
        .where(and(eq(videos.slug, targetSlug), isNull(videos.deletedAt)))
        .limit(1);
      if (clash.length > 0 && clash[0].id !== id) {
        throw new Error(`The slug "${targetSlug}" is already in use by another video.`);
      }
    }

    const nextVersion = current.version + 1;
    const now = new Date();

    await db
      .update(videos)
      .set({
        title: cleanTitle,
        slug: targetSlug,
        description: cleanDesc,
        categorySlug: data.categorySlug || null,
        startSeconds: data.startSeconds ?? null,
        uploadedOn: data.uploadedOn || null,
        version: nextVersion,
        updatedAt: now,
      })
      .where(eq(videos.id, id));

    await audit({
      actorUserId: owner.id,
      action: "video.update",
      entityType: "video",
      entityId: id,
      summary: `Updated video metadata for "${cleanTitle}"`,
      ip,
      userAgent,
    });

    await revalidateVideos(targetSlug);

    return { success: true, version: nextVersion, slug: targetSlug };
  });
}

/**
 * 4. setVideoStatusAction(id, newStatus)
 * Publishes or unpublishes a video.
 * Publishing requires title, description, and thumbnail.
 * Unpublishing checks for post references and warns.
 */
export async function setVideoStatusAction(
  id: string,
  newStatus: "draft" | "published"
) {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const rows = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, id), isNull(videos.deletedAt)))
      .limit(1);

    if (rows.length === 0) throw new Error("Video not found.");
    const v = rows[0];

    if (newStatus === "published") {
      if (!v.title || v.title.trim().length === 0) {
        throw new Error("Cannot publish: Video must have a title.");
      }
      if (!v.description || v.description.trim().length === 0) {
        throw new Error("Cannot publish: Video must have a description.");
      }
      if (!v.thumbnailMediaId) {
        throw new Error("Cannot publish: Video must have a thumbnail.");
      }
    }

    // Check if embedded in posts
    const postRefs = await db
      .select({ postTitle: posts.title })
      .from(postVideos)
      .innerJoin(posts, eq(postVideos.postId, posts.id))
      .where(eq(postVideos.videoId, id));

    const warningPosts = postRefs.map((p) => p.postTitle);

    const now = new Date();
    await db
      .update(videos)
      .set({
        status: newStatus,
        updatedAt: now,
        version: v.version + 1,
      })
      .where(eq(videos.id, id));

    await audit({
      actorUserId: owner.id,
      action: "video.set_status",
      entityType: "video",
      entityId: id,
      summary: `Changed status of "${v.title}" to ${newStatus}`,
      diff: { status: newStatus },
      ip,
      userAgent,
    });

    await revalidateVideos(v.slug);

    return {
      success: true,
      status: newStatus,
      warningPosts: newStatus === "draft" && warningPosts.length > 0 ? warningPosts : undefined,
    };
  });
}

/**
 * 5. setFeaturedAction(id)
 * Atomically swaps the single featured video.
 */
export async function setFeaturedAction(id: string) {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const rows = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, id), isNull(videos.deletedAt)))
      .limit(1);

    if (rows.length === 0) throw new Error("Video not found.");
    const v = rows[0];

    if (v.status !== "published") {
      throw new Error("Only published videos can be set as featured.");
    }

    // Handle featured exclusivity: clear previous featured video first, then set target
    await db
      .update(videos)
      .set({ featured: false })
      .where(eq(videos.featured, true));

    await db
      .update(videos)
      .set({ featured: true, updatedAt: new Date(), version: v.version + 1 })
      .where(eq(videos.id, id));

    await audit({
      actorUserId: owner.id,
      action: "video.set_featured",
      entityType: "video",
      entityId: id,
      summary: `Featured video set to "${v.title}"`,
      ip,
      userAgent,
    });

    await revalidateVideos();

    return { success: true };
  });
}

/**
 * 6. reorderVideosAction(orderedIds)
 * Updates sortOrder for videos in bulk transaction.
 */
export async function reorderVideosAction(orderedIds: string[]) {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    for (let i = 0; i < orderedIds.length; i++) {
      await db
        .update(videos)
        .set({ sortOrder: i + 1, updatedAt: new Date() })
        .where(eq(videos.id, orderedIds[i]));
    }

    await audit({
      actorUserId: owner.id,
      action: "video.reorder",
      entityType: "video",
      entityId: "bulk",
      summary: `Reordered ${orderedIds.length} videos`,
      ip,
      userAgent,
    });

    await revalidateVideos();

    return { success: true };
  });
}

/**
 * 7. setVideoThumbnailAction(id, mediaId)
 */
export async function setVideoThumbnailAction(id: string, mediaId: string) {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const mediaRows = await db
      .select({ id: media.id })
      .from(media)
      .where(and(eq(media.id, mediaId), isNull(media.deletedAt)))
      .limit(1);

    if (mediaRows.length === 0) {
      throw new Error("Selected media asset not found.");
    }

    await db
      .update(videos)
      .set({ thumbnailMediaId: mediaId, updatedAt: new Date() })
      .where(eq(videos.id, id));

    await audit({
      actorUserId: owner.id,
      action: "video.set_thumbnail",
      entityType: "video",
      entityId: id,
      summary: `Updated thumbnail for video ${id}`,
      ip,
      userAgent,
    });

    await revalidateVideos();

    return { success: true };
  });
}

/**
 * 8. reimportThumbnailAction(id)
 */
export async function reimportThumbnailAction(id: string) {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const rows = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, id), isNull(videos.deletedAt)))
      .limit(1);

    if (rows.length === 0) throw new Error("Video not found.");
    const v = rows[0];

    const thumbMedia = await importThumbnail({
      youtubeId: v.youtubeId,
      videoTitle: v.title,
      userId: owner.id,
      ip,
      userAgent,
    });

    await db
      .update(videos)
      .set({ thumbnailMediaId: thumbMedia.id, updatedAt: new Date() })
      .where(eq(videos.id, id));

    await audit({
      actorUserId: owner.id,
      action: "video.reimport_thumbnail",
      entityType: "video",
      entityId: id,
      summary: `Re-imported thumbnail from YouTube for "${v.title}"`,
      ip,
      userAgent,
    });

    await revalidateVideos(v.slug);

    return { success: true, mediaId: thumbMedia.id };
  });
}

/**
 * 9. trashVideoAction(id)
 * Moves video to Trash. Warns if embedded in posts.
 */
export async function trashVideoAction(id: string) {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const rows = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, id), isNull(videos.deletedAt)))
      .limit(1);

    if (rows.length === 0) throw new Error("Video not found.");
    const v = rows[0];

    // Check post usage
    const postRefs = await db
      .select({ postTitle: posts.title })
      .from(postVideos)
      .innerJoin(posts, eq(postVideos.postId, posts.id))
      .where(eq(postVideos.videoId, id));

    const warningPosts = postRefs.map((p) => p.postTitle);

    await db
      .update(videos)
      .set({
        deletedAt: new Date(),
        featured: false,
        updatedAt: new Date(),
      })
      .where(eq(videos.id, id));

    await audit({
      actorUserId: owner.id,
      action: "video.trash",
      entityType: "video",
      entityId: id,
      summary: `Moved video "${v.title}" to trash`,
      ip,
      userAgent,
    });

    await revalidateVideos(v.slug);

    return {
      success: true,
      warningPosts: warningPosts.length > 0 ? warningPosts : undefined,
    };
  });
}

/**
 * 10. restoreVideoAction(id)
 * Restores video as draft.
 */
export async function restoreVideoAction(id: string) {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const rows = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, id), isNotNull(videos.deletedAt)))
      .limit(1);

    if (rows.length === 0) throw new Error("Video not found in trash.");
    const v = rows[0];

    await db
      .update(videos)
      .set({
        deletedAt: null,
        status: "draft",
        featured: false,
        updatedAt: new Date(),
      })
      .where(eq(videos.id, id));

    await audit({
      actorUserId: owner.id,
      action: "video.restore",
      entityType: "video",
      entityId: id,
      summary: `Restored video "${v.title}" from trash as draft`,
      ip,
      userAgent,
    });

    await revalidateVideos(v.slug);

    return { success: true };
  });
}

/**
 * 11. deleteVideoPermanentlyAction(id, typedTitleConfirmation)
 * Permanently deletes video from Trash.
 * Strict guards:
 * - Fresh authentication required (SESSION_FRESH_AGE_SECONDS)
 * - Must be in Trash
 * - Typed title confirmation
 * - BLOCKED if referenced by any post
 */
export async function deleteVideoPermanentlyAction(
  id: string,
  typedTitleConfirmation: string
) {
  return withOwner(
    async ({ user: owner }) => {
      await enforceRateLimit("owner_mutation");
      const { ip, userAgent } = await getRequestMetadata();
      const db = getDb();
      if (!db) throw new Error("Database offline.");

      const rows = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, id), isNotNull(videos.deletedAt)))
        .limit(1);

      if (rows.length === 0) {
        throw new Error("Video not found in trash.");
      }
      const v = rows[0];

      if (typedTitleConfirmation.trim() !== v.title.trim()) {
        throw new Error(
          `Confirmation title mismatch. Please type "${v.title}" exactly to delete permanently.`
        );
      }

      // Check if any post still references this video
      const postRefs = await db
        .select({ postTitle: posts.title })
        .from(postVideos)
        .innerJoin(posts, eq(postVideos.postId, posts.id))
        .where(eq(postVideos.videoId, id));

      if (postRefs.length > 0) {
        const postTitles = postRefs.map((p) => `"${p.postTitle}"`).join(", ");
        throw new Error(
          `Cannot delete video permanently: It is currently embedded in the following posts: ${postTitles}. Please edit those posts first to remove the video block.`
        );
      }

      await db.delete(videos).where(eq(videos.id, id));

      await audit({
        actorUserId: owner.id,
        action: "video.delete_permanent",
        entityType: "video",
        entityId: id,
        summary: `Permanently deleted video "${v.title}"`,
        ip,
        userAgent,
      });

      await revalidateVideos();

      return { success: true };
    },
    { fresh: true }
  );
}

/**
 * Helper query for Owner UI: Get posts embedding a video
 */
export async function getVideoPostUsageAction(id: string) {
  return withOwner(async () => {
    const db = getDb();
    if (!db) return [];

    const rows = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        status: posts.status,
      })
      .from(postVideos)
      .innerJoin(posts, eq(postVideos.postId, posts.id))
      .where(eq(postVideos.videoId, id));

    return rows;
  });
}

/**
 * Server action for Client Components (e.g. VideoPickerModal) to fetch videos list.
 */
export async function getOwnerVideosListAction() {
  return withOwner(async () => {
    return getOwnerVideosList();
  });
}

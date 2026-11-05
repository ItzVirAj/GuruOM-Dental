import "server-only";

import { unstable_cache } from "next/cache";
import { eq, and, isNull, desc, asc, sql, notInArray } from "drizzle-orm";
import { getDb } from "@/src/db/client";
import { videos, media, postVideos, categories } from "@/src/db/schema";
import { VIDEOS_CACHE_TAG } from "./revalidate";

export interface PublicVideoThumbnail {
  url: string;
  width: number;
  height: number;
  blur?: string;
}

export interface PublicVideoDTO {
  id: string;
  slug: string;
  title: string;
  description: string;
  youtubeId: string;
  startSeconds: number | null;
  thumbnail: PublicVideoThumbnail;
  categorySlug: string | null;
  categoryLabel?: string;
  uploadedOn: string | null;
}

function cachedQuery<T>(
  queryFn: () => Promise<T>,
  keyParts: string[]
): Promise<T> {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test" ||
    !process.env.NEXT_RUNTIME
  ) {
    return queryFn();
  }
  return unstable_cache(queryFn, keyParts, {
    tags: [VIDEOS_CACHE_TAG],
    revalidate: 300,
  })();
}

/**
 * Returns live videos (status = 'published' AND deleted_at IS NULL).
 * Optional category filter and pagination.
 */
export async function getLiveVideos(options: {
  category?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ items: PublicVideoDTO[]; total: number }> {
  const { category, limit = 20, offset = 0 } = options;

  return cachedQuery(async () => {
    const db = getDb();
    if (!db) return { items: [], total: 0 };

    const conditions = [
      eq(videos.status, "published"),
      isNull(videos.deletedAt),
    ];

    if (category) {
      conditions.push(eq(videos.categorySlug, category));
    }

    const whereClause = and(...conditions);

    // Get count
    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(videos)
      .where(whereClause);

    const total = countRow?.count ?? 0;

    // Get items joined with media and categories
    const rows = await db
      .select({
        id: videos.id,
        slug: videos.slug,
        title: videos.title,
        description: videos.description,
        youtubeId: videos.youtubeId,
        startSeconds: videos.startSeconds,
        categorySlug: videos.categorySlug,
        uploadedOn: videos.uploadedOn,
        mediaSecureUrl: media.secureUrl,
        mediaWidth: media.width,
        mediaHeight: media.height,
        mediaBlur: media.blurDataUrl,
        categoryLabel: categories.label,
      })
      .from(videos)
      .innerJoin(media, eq(videos.thumbnailMediaId, media.id))
      .leftJoin(categories, eq(videos.categorySlug, categories.slug))
      .where(whereClause)
      .orderBy(asc(videos.sortOrder), desc(videos.createdAt))
      .limit(limit)
      .offset(offset);

    const items: PublicVideoDTO[] = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      youtubeId: r.youtubeId,
      startSeconds: r.startSeconds,
      thumbnail: {
        url: r.mediaSecureUrl,
        width: r.mediaWidth,
        height: r.mediaHeight,
        blur: r.mediaBlur || undefined,
      },
      categorySlug: r.categorySlug,
      categoryLabel: r.categoryLabel || undefined,
      uploadedOn: r.uploadedOn,
    }));

    return { items, total };
  }, ["live_videos", category || "all", String(limit), String(offset)]);
}

/**
 * Returns a single live video by slug, or null if missing/not live.
 */
export async function getLiveVideoBySlug(slug: string): Promise<PublicVideoDTO | null> {
  if (!slug) return null;

  return cachedQuery(async () => {
    const db = getDb();
    if (!db) return null;

    const rows = await db
      .select({
        id: videos.id,
        slug: videos.slug,
        title: videos.title,
        description: videos.description,
        youtubeId: videos.youtubeId,
        startSeconds: videos.startSeconds,
        categorySlug: videos.categorySlug,
        uploadedOn: videos.uploadedOn,
        mediaSecureUrl: media.secureUrl,
        mediaWidth: media.width,
        mediaHeight: media.height,
        mediaBlur: media.blurDataUrl,
        categoryLabel: categories.label,
      })
      .from(videos)
      .innerJoin(media, eq(videos.thumbnailMediaId, media.id))
      .leftJoin(categories, eq(videos.categorySlug, categories.slug))
      .where(
        and(
          eq(videos.slug, slug),
          eq(videos.status, "published"),
          isNull(videos.deletedAt)
        )
      )
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];

    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      youtubeId: r.youtubeId,
      startSeconds: r.startSeconds,
      thumbnail: {
        url: r.mediaSecureUrl,
        width: r.mediaWidth,
        height: r.mediaHeight,
        blur: r.mediaBlur || undefined,
      },
      categorySlug: r.categorySlug,
      categoryLabel: r.categoryLabel || undefined,
      uploadedOn: r.uploadedOn,
    };
  }, ["live_video_slug", slug]);
}

/**
 * Returns the currently active featured video, or null if none set.
 */
export async function getFeaturedVideo(): Promise<PublicVideoDTO | null> {
  return cachedQuery(async () => {
    const db = getDb();
    if (!db) return null;

    const rows = await db
      .select({
        id: videos.id,
        slug: videos.slug,
        title: videos.title,
        description: videos.description,
        youtubeId: videos.youtubeId,
        startSeconds: videos.startSeconds,
        categorySlug: videos.categorySlug,
        uploadedOn: videos.uploadedOn,
        mediaSecureUrl: media.secureUrl,
        mediaWidth: media.width,
        mediaHeight: media.height,
        mediaBlur: media.blurDataUrl,
        categoryLabel: categories.label,
      })
      .from(videos)
      .innerJoin(media, eq(videos.thumbnailMediaId, media.id))
      .leftJoin(categories, eq(videos.categorySlug, categories.slug))
      .where(
        and(
          eq(videos.featured, true),
          eq(videos.status, "published"),
          isNull(videos.deletedAt)
        )
      )
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];

    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      youtubeId: r.youtubeId,
      startSeconds: r.startSeconds,
      thumbnail: {
        url: r.mediaSecureUrl,
        width: r.mediaWidth,
        height: r.mediaHeight,
        blur: r.mediaBlur || undefined,
      },
      categorySlug: r.categorySlug,
      categoryLabel: r.categoryLabel || undefined,
      uploadedOn: r.uploadedOn,
    };
  }, ["featured_video"]);
}

/**
 * Returns related live videos for a video page (same category preferred, excluding current).
 */
export async function getRelatedVideos(options: {
  videoId: string;
  categorySlug?: string | null;
  limit?: number;
}): Promise<PublicVideoDTO[]> {
  const { videoId, categorySlug, limit = 3 } = options;

  return cachedQuery(async () => {
    const db = getDb();
    if (!db) return [];

    const baseConditions = [
      eq(videos.status, "published"),
      isNull(videos.deletedAt),
      sql`${videos.id} != ${videoId}`,
    ];

    type VideoRow = {
      id: string;
      slug: string;
      title: string;
      description: string;
      youtubeId: string;
      startSeconds: number | null;
      categorySlug: string | null;
      uploadedOn: string | null;
      mediaSecureUrl: string;
      mediaWidth: number;
      mediaHeight: number;
      mediaBlur: string | null;
      categoryLabel: string | null;
    };

    let rows: VideoRow[] = [];
    if (categorySlug) {
      rows = await db
        .select({
          id: videos.id,
          slug: videos.slug,
          title: videos.title,
          description: videos.description,
          youtubeId: videos.youtubeId,
          startSeconds: videos.startSeconds,
          categorySlug: videos.categorySlug,
          uploadedOn: videos.uploadedOn,
          mediaSecureUrl: media.secureUrl,
          mediaWidth: media.width,
          mediaHeight: media.height,
          mediaBlur: media.blurDataUrl,
          categoryLabel: categories.label,
        })
        .from(videos)
        .innerJoin(media, eq(videos.thumbnailMediaId, media.id))
        .leftJoin(categories, eq(videos.categorySlug, categories.slug))
        .where(and(...baseConditions, eq(videos.categorySlug, categorySlug)))
        .orderBy(asc(videos.sortOrder), desc(videos.createdAt))
        .limit(limit);
    }

    if (rows.length < limit) {
      const remainingLimit = limit - rows.length;
      const existingIds = [videoId, ...rows.map((r) => r.id)];

      const extraRows = await db
        .select({
          id: videos.id,
          slug: videos.slug,
          title: videos.title,
          description: videos.description,
          youtubeId: videos.youtubeId,
          startSeconds: videos.startSeconds,
          categorySlug: videos.categorySlug,
          uploadedOn: videos.uploadedOn,
          mediaSecureUrl: media.secureUrl,
          mediaWidth: media.width,
          mediaHeight: media.height,
          mediaBlur: media.blurDataUrl,
          categoryLabel: categories.label,
        })
        .from(videos)
        .innerJoin(media, eq(videos.thumbnailMediaId, media.id))
        .leftJoin(categories, eq(videos.categorySlug, categories.slug))
        .where(
          and(
            eq(videos.status, "published"),
            isNull(videos.deletedAt),
            notInArray(videos.id, existingIds)
          )
        )
        .orderBy(asc(videos.sortOrder), desc(videos.createdAt))
        .limit(remainingLimit);

      rows = [...rows, ...extraRows];
    }

    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      youtubeId: r.youtubeId,
      startSeconds: r.startSeconds,
      thumbnail: {
        url: r.mediaSecureUrl,
        width: r.mediaWidth,
        height: r.mediaHeight,
        blur: r.mediaBlur || undefined,
      },
      categorySlug: r.categorySlug,
      categoryLabel: r.categoryLabel || undefined,
      uploadedOn: r.uploadedOn,
    }));
  }, ["related_videos", videoId, categorySlug || "none", String(limit)]);
}

/**
 * Returns a map of videoId -> PublicVideoDTO for all videos embedded in a post.
 * Executes in a SINGLE query with zero N+1.
 * Only published, non-deleted videos are returned; non-live videos are skipped.
 */
export async function getVideosForPost(
  postId: string
): Promise<Record<string, PublicVideoDTO>> {
  if (!postId) return {};

  return cachedQuery(async () => {
    const db = getDb();
    if (!db) return {};

    const rows = await db
      .select({
        id: videos.id,
        slug: videos.slug,
        title: videos.title,
        description: videos.description,
        youtubeId: videos.youtubeId,
        startSeconds: videos.startSeconds,
        categorySlug: videos.categorySlug,
        uploadedOn: videos.uploadedOn,
        mediaSecureUrl: media.secureUrl,
        mediaWidth: media.width,
        mediaHeight: media.height,
        mediaBlur: media.blurDataUrl,
        categoryLabel: categories.label,
      })
      .from(postVideos)
      .innerJoin(videos, eq(postVideos.videoId, videos.id))
      .innerJoin(media, eq(videos.thumbnailMediaId, media.id))
      .leftJoin(categories, eq(videos.categorySlug, categories.slug))
      .where(
        and(
          eq(postVideos.postId, postId),
          eq(videos.status, "published"),
          isNull(videos.deletedAt)
        )
      );

    const map: Record<string, PublicVideoDTO> = {};
    for (const r of rows) {
      map[r.id] = {
        id: r.id,
        slug: r.slug,
        title: r.title,
        description: r.description,
        youtubeId: r.youtubeId,
        startSeconds: r.startSeconds,
        thumbnail: {
          url: r.mediaSecureUrl,
          width: r.mediaWidth,
          height: r.mediaHeight,
          blur: r.mediaBlur || undefined,
        },
        categorySlug: r.categorySlug,
        categoryLabel: r.categoryLabel || undefined,
        uploadedOn: r.uploadedOn,
      };
    }

    return map;
  }, ["post_videos_map", postId]);
}

/**
 * Returns all slugs of live published videos for sitemap and generateStaticParams.
 */
export async function getAllLiveVideoSlugs(): Promise<string[]> {
  return cachedQuery(async () => {
    const db = getDb();
    if (!db) return [];

    const rows = await db
      .select({ slug: videos.slug })
      .from(videos)
      .where(
        and(
          eq(videos.status, "published"),
          isNull(videos.deletedAt)
        )
      );

    return rows.map((r) => r.slug);
  }, ["all_live_video_slugs"]);
}

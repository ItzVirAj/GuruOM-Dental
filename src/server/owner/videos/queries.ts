import "server-only";

import { eq, desc, asc } from "drizzle-orm";
import { getDb } from "@/src/db/client";
import { videos, media, categories, postVideos, posts } from "@/src/db/schema";
import { requireOwner } from "@/src/server/auth/guard";

export interface OwnerVideoItem {
  id: string;
  youtubeId: string;
  slug: string;
  title: string;
  description: string;
  channelName: string | null;
  categorySlug: string | null;
  categoryLabel?: string;
  thumbnailMediaId: string;
  thumbnailUrl: string;
  thumbnailBlur?: string;
  startSeconds: number | null;
  uploadedOn: string | null;
  status: "draft" | "published";
  featured: boolean;
  sortOrder: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export async function getOwnerVideosList(): Promise<OwnerVideoItem[]> {
  await requireOwner();
  const db = getDb();
  if (!db) return [];

  const rows = await db
    .select({
      id: videos.id,
      youtubeId: videos.youtubeId,
      slug: videos.slug,
      title: videos.title,
      description: videos.description,
      channelName: videos.channelName,
      categorySlug: videos.categorySlug,
      categoryLabel: categories.label,
      thumbnailMediaId: videos.thumbnailMediaId,
      thumbnailUrl: media.secureUrl,
      thumbnailBlur: media.blurDataUrl,
      startSeconds: videos.startSeconds,
      uploadedOn: videos.uploadedOn,
      status: videos.status,
      featured: videos.featured,
      sortOrder: videos.sortOrder,
      version: videos.version,
      createdAt: videos.createdAt,
      updatedAt: videos.updatedAt,
      deletedAt: videos.deletedAt,
    })
    .from(videos)
    .innerJoin(media, eq(videos.thumbnailMediaId, media.id))
    .leftJoin(categories, eq(videos.categorySlug, categories.slug))
    .orderBy(asc(videos.sortOrder), desc(videos.createdAt));

  return rows.map((r) => ({
    ...r,
    thumbnailBlur: r.thumbnailBlur || undefined,
    categoryLabel: r.categoryLabel || undefined,
  }));
}

export async function getOwnerVideoForEditing(id: string) {
  await requireOwner();
  const db = getDb();
  if (!db) return null;

  const rows = await db
    .select({
      id: videos.id,
      youtubeId: videos.youtubeId,
      slug: videos.slug,
      title: videos.title,
      description: videos.description,
      channelName: videos.channelName,
      categorySlug: videos.categorySlug,
      categoryLabel: categories.label,
      thumbnailMediaId: videos.thumbnailMediaId,
      thumbnailUrl: media.secureUrl,
      thumbnailBlur: media.blurDataUrl,
      thumbnailAlt: media.alt,
      startSeconds: videos.startSeconds,
      uploadedOn: videos.uploadedOn,
      status: videos.status,
      featured: videos.featured,
      sortOrder: videos.sortOrder,
      version: videos.version,
      createdAt: videos.createdAt,
      updatedAt: videos.updatedAt,
      deletedAt: videos.deletedAt,
    })
    .from(videos)
    .innerJoin(media, eq(videos.thumbnailMediaId, media.id))
    .leftJoin(categories, eq(videos.categorySlug, categories.slug))
    .where(eq(videos.id, id))
    .limit(1);

  if (rows.length === 0) return null;
  const v = rows[0];

  // Fetch posts referencing this video
  const postRefs = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
    })
    .from(postVideos)
    .innerJoin(posts, eq(postVideos.postId, posts.id))
    .where(eq(postVideos.videoId, id));

  // Fetch all categories for selector
  const allCategories = await db
    .select({
      slug: categories.slug,
      label: categories.label,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder));

  return {
    video: {
      ...v,
      thumbnailBlur: v.thumbnailBlur || undefined,
      categoryLabel: v.categoryLabel || undefined,
      thumbnailAlt: v.thumbnailAlt || "",
    },
    posts: postRefs,
    categories: allCategories,
  };
}

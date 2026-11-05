"use server";

import "server-only";
import { headers } from "next/headers";
import { getDb } from "@/src/db/client";
import { media, postMedia, posts } from "@/src/db/schema";
import {
  eq,
  and,
  isNull,
  isNotNull,
  or,
  ilike,
  desc,
  lt,
  sql,
  gte,
} from "drizzle-orm";
import { withOwner } from "@/src/server/auth/guard";
import { getClientIp } from "@/src/server/auth/ip";
import { checkRateLimit } from "@/src/server/security/rate-limit";
import { audit } from "@/src/server/security/audit";
import { getCloudinaryConfig } from "@/src/lib/env";
import { mediaThumbUrl } from "@/src/lib/media/cloudinary-loader";
import {
  processAndStoreImage,
  StoredMediaResult,
} from "@/src/server/media/pipeline";

export type { StoredMediaResult };

async function enforceRateLimit(bucket: "owner_mutation") {
  const ip = await getClientIp();
  const res = await checkRateLimit(bucket, ip);
  if (!res.allowed) {
    throw new Error(
      `Rate limit exceeded. Please wait ${res.retryAfterSeconds} seconds before retrying.`
    );
  }
}

async function getRequestMetadata() {
  const reqHeaders = await headers();
  const ip = await getClientIp();
  const userAgent = reqHeaders.get("user-agent") || undefined;
  return { ip, userAgent };
}

export type MediaFilter = "all" | "unused" | "missing-alt" | "trash";

export interface MediaItem {
  id: string;
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  alt: string | null;
  decorative: boolean;
  displayName: string;
  blurDataUrl: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  usageCount: number;
  thumbUrl: string;
}

export interface ListMediaOptions {
  q?: string;
  filter?: MediaFilter;
  cursor?: string;
  limit?: number;
}

export interface ListMediaResponse {
  items: MediaItem[];
  nextCursor: string | null;
  totalCount: number;
  storageBytes: number;
  storageCapBytes: number;
}

export interface MediaUsagePost {
  id: string;
  title: string;
  slug: string;
  status: string;
  role: "cover" | "inline";
}

/**
 * Lists media items with search, filtering, and cursor pagination.
 */
export async function listMediaAction(
  options: ListMediaOptions = {}
): Promise<ListMediaResponse> {
  return withOwner(async () => {
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const config = getCloudinaryConfig();
    const limit = Math.min(Math.max(options.limit || 40, 1), 100);
    const filter = options.filter || "all";
    const search = options.q?.trim() || "";

    // Base conditions
    const conditions = [];

    // Filter logic
    if (filter === "trash") {
      conditions.push(isNotNull(media.deletedAt));
    } else {
      conditions.push(isNull(media.deletedAt));

      if (filter === "missing-alt") {
        conditions.push(
          and(
            eq(media.decorative, false),
            or(isNull(media.alt), eq(media.alt, ""))
          )
        );
      } else if (filter === "unused") {
        // Media not referenced in post_media
        conditions.push(
          sql`${media.id} NOT IN (SELECT DISTINCT media_id FROM ${postMedia})`
        );
      }
    }

    // Search query
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          ilike(media.displayName, searchPattern),
          ilike(media.alt, searchPattern),
          ilike(media.publicId, searchPattern)
        )
      );
    }

    // Cursor pagination (createdAt < cursorDate or id < cursorId)
    if (options.cursor) {
      try {
        const cursorDate = new Date(options.cursor);
        if (!isNaN(cursorDate.getTime())) {
          conditions.push(lt(media.createdAt, cursorDate));
        }
      } catch {}
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch items with +1 for nextCursor check
    const rows = await db
      .select({
        id: media.id,
        publicId: media.publicId,
        secureUrl: media.secureUrl,
        width: media.width,
        height: media.height,
        bytes: media.bytes,
        format: media.format,
        alt: media.alt,
        decorative: media.decorative,
        displayName: media.displayName,
        blurDataUrl: media.blurDataUrl,
        createdAt: media.createdAt,
        deletedAt: media.deletedAt,
        usageCount: sql<number>`(
          SELECT count(*)::int FROM ${postMedia} WHERE ${postMedia.mediaId} = ${media.id}
        )`,
      })
      .from(media)
      .where(whereClause)
      .orderBy(desc(media.createdAt), desc(media.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor =
      hasMore && items.length > 0
        ? items[items.length - 1].createdAt.toISOString()
        : null;

    // Storage and count summaries
    const [storageSummary] = await db
      .select({
        totalBytes: sql<string>`coalesce(sum(${media.bytes}), 0)`,
        totalCount: sql<number>`count(*)::int`,
      })
      .from(media)
      .where(isNull(media.deletedAt));

    const formattedItems: MediaItem[] = items.map((item) => ({
      ...item,
      usageCount: Number(item.usageCount || 0),
      thumbUrl: mediaThumbUrl(item.publicId),
    }));

    return {
      items: formattedItems,
      nextCursor,
      totalCount: Number(storageSummary?.totalCount || 0),
      storageBytes: Number(storageSummary?.totalBytes || 0),
      storageCapBytes: config.mediaLibraryMaxBytes,
    };
  });
}

/**
 * Updates alt text and decorative flag on a media item.
 */
export async function updateMediaAltAction(
  id: string,
  alt: string | null,
  decorative: boolean
): Promise<{ success: boolean }> {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const cleanAlt = decorative ? null : (alt || "").trim().slice(0, 200) || null;

    const [existing] = await db
      .select({ id: media.id, displayName: media.displayName })
      .from(media)
      .where(eq(media.id, id))
      .limit(1);

    if (!existing) {
      throw new Error("Media asset not found.");
    }

    await db
      .update(media)
      .set({
        alt: cleanAlt,
        decorative,
      })
      .where(eq(media.id, id));

    await audit({
      actorUserId: owner.id,
      action: "media.update_alt",
      entityType: "media",
      entityId: id,
      summary: `Updated alt text for "${existing.displayName}" (decorative: ${decorative})`,
      ip,
      userAgent,
    });

    return { success: true };
  });
}

/**
 * Retrieves the list of posts referencing this media item.
 */
export async function getMediaUsageAction(id: string): Promise<MediaUsagePost[]> {
  return withOwner(async () => {
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const rows = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        status: posts.status,
        role: postMedia.role,
      })
      .from(postMedia)
      .innerJoin(posts, eq(postMedia.postId, posts.id))
      .where(eq(postMedia.mediaId, id));

    return rows;
  });
}

/**
 * Soft deletes a media item, preventing deletion if currently used in posts.
 */
export async function deleteMediaAction(
  id: string
): Promise<{ success: boolean; blockedByPosts?: MediaUsagePost[] }> {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    // Check if media is referenced by any posts
    const usage = await getMediaUsageAction(id);
    if (usage.length > 0) {
      return {
        success: false,
        blockedByPosts: usage,
      };
    }

    const [existing] = await db
      .select({ id: media.id, displayName: media.displayName })
      .from(media)
      .where(eq(media.id, id))
      .limit(1);

    if (!existing) {
      throw new Error("Media asset not found.");
    }

    const now = new Date();
    await db
      .update(media)
      .set({ deletedAt: now })
      .where(eq(media.id, id));

    await audit({
      actorUserId: owner.id,
      action: "media.soft_delete",
      entityType: "media",
      entityId: id,
      summary: `Soft-deleted media asset "${existing.displayName}"`,
      ip,
      userAgent,
    });

    return { success: true };
  });
}

/**
 * Restores a soft-deleted media item from trash.
 */
export async function restoreMediaAction(id: string): Promise<{ success: boolean }> {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const [existing] = await db
      .select({ id: media.id, displayName: media.displayName })
      .from(media)
      .where(eq(media.id, id))
      .limit(1);

    if (!existing) {
      throw new Error("Media asset not found.");
    }

    await db
      .update(media)
      .set({ deletedAt: null })
      .where(eq(media.id, id));

    await audit({
      actorUserId: owner.id,
      action: "media.restore",
      entityType: "media",
      entityId: id,
      summary: `Restored media asset "${existing.displayName}" from trash`,
      ip,
      userAgent,
    });

    return { success: true };
  });
}

/**
 * Uploads, validates, re-encodes, optimizes, and stores an image via Server Action.
 */
export async function uploadMediaAction(
  formData: FormData
): Promise<StoredMediaResult> {
  return withOwner(async ({ user: owner }) => {
    const { ip, userAgent } = await getRequestMetadata();

    // 1. Rate limiting (20/min per client IP)
    const rlResult = await checkRateLimit("owner_media_upload", ip);
    if (!rlResult.allowed) {
      throw new Error(
        `Upload rate limit exceeded. Please wait ${rlResult.retryAfterSeconds} seconds before retrying.`
      );
    }

    // 2. Cloudinary configuration check
    const config = getCloudinaryConfig();
    if (!config.isConfigured) {
      throw new Error(
        "Cloudinary storage is not fully configured on this server. Please set CLOUDINARY_API_SECRET in .env.local."
      );
    }

    const db = getDb();
    if (!db) throw new Error("Database offline.");

    // 3. Enforce Daily Upload Cap
    const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [dailyRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(media)
      .where(gte(media.createdAt, past24h));

    if ((dailyRow?.count ?? 0) >= config.dailyUploadLimit) {
      throw new Error(
        `Daily upload cap reached (${config.dailyUploadLimit} uploads per 24 hours). Try again later.`
      );
    }

    // 4. Enforce Media Library Total Storage Cap
    const [storageRow] = await db
      .select({ totalBytes: sql<string>`coalesce(sum(${media.bytes}), 0)` })
      .from(media)
      .where(isNull(media.deletedAt));

    const currentTotalBytes = Number(storageRow?.totalBytes || 0);
    if (currentTotalBytes >= config.mediaLibraryMaxBytes) {
      throw new Error(
        `Media library storage soft cap reached (${Math.round(
          config.mediaLibraryMaxBytes / (1024 * 1024)
        )}MB). Please delete unused assets.`
      );
    }

    // 5. Rights confirmation check
    const confirmedRights = formData.get("confirmedRights");
    if (confirmedRights !== "true") {
      throw new Error(
        "You must confirm that you have the right to upload and publish this image."
      );
    }

    // 6. Extract file
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      throw new Error("Missing or invalid image file.");
    }

    const rawAlt = (formData.get("alt") as string)?.trim() || "";
    const isDecorative = formData.get("decorative") === "true";
    const altText = isDecorative ? "" : rawAlt.slice(0, 200);

    const rawBytes = Buffer.from(await file.arrayBuffer());
    if (rawBytes.length > config.uploadMaxBytes) {
      throw new Error(
        `File size (${(rawBytes.length / (1024 * 1024)).toFixed(
          2
        )}MB) exceeds maximum limit of ${(
          config.uploadMaxBytes /
          (1024 * 1024)
        ).toFixed(1)}MB.`
      );
    }

    // 7. Process and store image via reusable pipeline
    const filename = file instanceof File ? file.name : "uploaded-image.webp";
    const result = await processAndStoreImage(rawBytes, {
      originalFilename: filename,
      altText,
      isDecorative,
      userId: owner.id,
      source: "upload",
      ip,
      userAgent,
    });

    return result;
  });
}



import "server-only";
import crypto from "node:crypto";
import sharp, { type Metadata } from "sharp";
import { fileTypeFromBuffer } from "file-type";
import { getDb } from "@/src/db/client";
import { media, mediaDeletions } from "@/src/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getCloudinaryConfig } from "@/src/lib/env";
import {
  uploadStreamToCloudinary,
  destroyCloudinaryAsset,
} from "@/src/server/media/cloudinary";
import { mediaThumbUrl } from "@/src/lib/media/cloudinary-loader";
import { audit } from "@/src/server/security/audit";
import { logger } from "@/src/lib/logger";

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export interface ProcessImageOptions {
  originalFilename?: string;
  altText?: string;
  isDecorative?: boolean;
  userId?: string | null;
  source?: string;
  ip?: string;
  userAgent?: string;
}

export interface StoredMediaResult {
  id: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  thumbUrl: string;
  displayName: string;
  alt: string;
  decorative: boolean;
  blurDataUrl?: string;
  isDuplicate: boolean;
}

export class ImageProcessingError extends Error {
  constructor(message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = "ImageProcessingError";
  }
}

/**
 * Reusable server-side image processing, optimization, deduplication, and Cloudinary storage pipeline.
 * Used by owner direct upload and external image importers (e.g. YouTube thumbnails).
 */
export async function processAndStoreImage(
  rawBytes: Buffer,
  options: ProcessImageOptions = {}
): Promise<StoredMediaResult> {
  const config = getCloudinaryConfig();
  if (!config.isConfigured) {
    throw new ImageProcessingError(
      "Cloudinary storage is not configured on this server.",
      503
    );
  }

  // 1. Inspect magic bytes
  const detectedType = await fileTypeFromBuffer(rawBytes);
  if (!detectedType || !ALLOWED_IMAGE_MIME_TYPES.has(detectedType.mime)) {
    throw new ImageProcessingError(
      "Unsupported file format. Please provide JPEG, PNG, WebP, or AVIF images.",
      415
    );
  }

  // 2. Process image through Sharp (limit input pixels to 40M to prevent decompression bombs)
  let processedBuffer: Buffer;
  let processedMeta: Metadata;
  try {
    const pipeline = sharp(rawBytes, {
      failOn: "error",
      limitInputPixels: 40_000_000,
    })
      .rotate()
      .resize(2400, 2400, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 88,
        effort: 4,
      });

    processedBuffer = await pipeline.toBuffer();
    processedMeta = await sharp(processedBuffer).metadata();

    if (!processedMeta.width || !processedMeta.height) {
      throw new Error("Failed to extract processed image dimensions");
    }
  } catch (sharpErr) {
    logger.warn("Sharp image processing failed:", sharpErr);
    throw new ImageProcessingError(
      "Image processing failed. The file may be corrupt or exceed pixel bounds.",
      400
    );
  }

  // 3. Deduplication check via SHA-256
  const sha256 = crypto
    .createHash("sha256")
    .update(processedBuffer)
    .digest("hex");

  const db = getDb();
  if (!db) {
    throw new ImageProcessingError("Database is offline", 503);
  }

  const existingDups = await db
    .select()
    .from(media)
    .where(and(eq(media.sha256, sha256), isNull(media.deletedAt)))
    .limit(1);

  if (existingDups.length > 0) {
    const dup = existingDups[0];
    return {
      id: dup.id,
      publicId: dup.publicId,
      width: dup.width,
      height: dup.height,
      bytes: dup.bytes,
      thumbUrl: mediaThumbUrl(dup.publicId),
      displayName: dup.displayName,
      alt: dup.alt ?? "",
      decorative: dup.decorative,
      blurDataUrl: dup.blurDataUrl || undefined,
      isDuplicate: true,
    };
  }

  // 4. Generate blur placeholder (<1KB WebP base64)
  let blurDataUrl = "";
  try {
    const blurBuffer = await sharp(processedBuffer)
      .resize(12, 12, { fit: "inside" })
      .webp({ quality: 35 })
      .toBuffer();
    blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
  } catch {
    blurDataUrl = "";
  }

  // 5. Cloudinary Upload
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const uploadFolder = `${config.folder}/${yyyy}-${mm}`;
  const randomAssetUuid = crypto.randomUUID();

  const originalFilename = options.originalFilename || "image.webp";
  const sanitizedDisplayName = originalFilename
    .replace(/[^\w.-]/g, "_")
    .slice(0, 120);

  let uploadResult;
  try {
    uploadResult = await uploadStreamToCloudinary(processedBuffer, {
      folder: uploadFolder,
      public_id: randomAssetUuid,
      resource_type: "image",
      format: "webp",
    });
  } catch (cldErr) {
    logger.error("Cloudinary upload failed:", cldErr);
    throw new ImageProcessingError(
      "Image storage upload failed. Please try again.",
      502
    );
  }

  // 6. Insert row into database
  const mediaId = crypto.randomUUID();
  const altText = options.altText?.slice(0, 200) || "";
  const isDecorative = Boolean(options.isDecorative);

  try {
    await db.insert(media).values({
      id: mediaId,
      publicId: uploadResult.public_id,
      secureUrl: uploadResult.secure_url,
      width: processedMeta.width ?? uploadResult.width,
      height: processedMeta.height ?? uploadResult.height,
      bytes: processedBuffer.length,
      format: "webp",
      alt: altText,
      decorative: isDecorative,
      displayName: sanitizedDisplayName,
      blurDataUrl,
      sha256,
      uploadedBy: options.userId ?? null,
      createdAt: now,
    });
  } catch (dbErr) {
    logger.error("Database insert failed for uploaded media. Cleaning up Cloudinary:", dbErr);
    const destroyed = await destroyCloudinaryAsset(uploadResult.public_id);
    if (!destroyed) {
      try {
        await db.insert(mediaDeletions).values({
          publicId: uploadResult.public_id,
          attempts: 1,
          lastError: dbErr instanceof Error ? dbErr.message : "DB insert failed",
        });
      } catch (qErr) {
        logger.error("Failed to queue orphan deletion in media_deletions:", qErr);
      }
    }
    throw new ImageProcessingError(
      "Database registration failed for uploaded media.",
      500
    );
  }

  // 7. Audit log if user is present or source specified
  if (options.userId || options.source) {
    await audit({
      actorUserId: options.userId || "system",
      action: options.source === "youtube-thumbnail" ? "media.import_thumbnail" : "media.upload",
      entityType: "media",
      entityId: mediaId,
      summary: `Stored image "${sanitizedDisplayName}" (${(
        processedBuffer.length / 1024
      ).toFixed(1)} KB) via ${options.source || "upload"}`,
      ip: options.ip,
      userAgent: options.userAgent,
    });
  }

  return {
    id: mediaId,
    publicId: uploadResult.public_id,
    width: processedMeta.width ?? uploadResult.width,
    height: processedMeta.height ?? uploadResult.height,
    bytes: processedBuffer.length,
    thumbUrl: mediaThumbUrl(uploadResult.public_id),
    displayName: sanitizedDisplayName,
    alt: altText,
    decorative: isDecorative,
    blurDataUrl,
    isDuplicate: false,
  };
}

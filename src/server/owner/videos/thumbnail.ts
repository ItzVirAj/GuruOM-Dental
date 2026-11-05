import "server-only";
import { processAndStoreImage, StoredMediaResult } from "../../media/pipeline";
import { logger } from "../../../lib/logger";

export class ThumbnailImportError extends Error {
  constructor(message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = "ThumbnailImportError";
  }
}

async function fetchThumbnailBuffer(url: string): Promise<Buffer | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "image/jpeg,image/webp,image/*",
        "User-Agent": "GuruOmDental-ThumbnailBot/1.0",
      },
      redirect: "error",
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timer);

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      logger.warn(`Thumbnail fetch returned status ${res.status} for ${url}`);
      return null;
    }

    if (!res.body) return null;

    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    const MAX_BYTES = 2 * 1024 * 1024; // 2 MB limit

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.length;
        if (totalBytes > MAX_BYTES) {
          await reader.cancel();
          throw new ThumbnailImportError("Thumbnail size exceeded 2MB limit.", 502);
        }
        chunks.push(value);
      }
    }

    return Buffer.concat(chunks);
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof ThumbnailImportError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      logger.warn(`Thumbnail fetch timed out for ${url}`);
      return null;
    }
    logger.warn(`Thumbnail fetch network error for ${url}:`, err);
    return null;
  }
}

export interface ImportThumbnailOptions {
  youtubeId: string;
  videoTitle?: string;
  userId?: string | null;
  ip?: string;
  userAgent?: string;
}

/**
 * SSRF-hardened thumbnail importer from fixed YouTube CDN hosts:
 * - Attempts maxresdefault.jpg first, falls back to hqdefault.jpg
 * - Redirects strictly forbidden
 * - 5-second timeout, 2MB size cap
 * - Feeds into the shared processAndStoreImage pipeline (magic bytes, sharp optimization, dedupe, Cloudinary, DB)
 */
export async function importThumbnail(
  options: ImportThumbnailOptions
): Promise<StoredMediaResult> {
  const { youtubeId, videoTitle = "Untitled", userId, ip, userAgent } = options;

  if (!/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
    throw new ThumbnailImportError("Invalid YouTube ID for thumbnail import.", 400);
  }

  // 1. Fetch high-res thumbnail with fallback
  let buffer = await fetchThumbnailBuffer(
    `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
  );

  if (!buffer) {
    buffer = await fetchThumbnailBuffer(
      `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
    );
  }

  if (!buffer) {
    throw new ThumbnailImportError(
      "Could not retrieve thumbnail from YouTube CDN. Please select a thumbnail manually.",
      502
    );
  }

  // 2. Process and store in Cloudinary & Media table via shared pipeline
  const altText = `Thumbnail of the video: ${videoTitle}`.slice(0, 200);

  const mediaResult = await processAndStoreImage(buffer, {
    originalFilename: `youtube-${youtubeId}.webp`,
    altText,
    isDecorative: false,
    userId,
    source: "youtube-thumbnail",
    ip,
    userAgent,
  });

  return mediaResult;
}

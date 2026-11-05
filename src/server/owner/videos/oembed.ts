import "server-only";
import { z } from "zod";
import { logger } from "../../../lib/logger";

const oembedSchema = z.object({
  title: z.string().min(1).max(200),
  author_name: z.string().max(150).optional().default(""),
  thumbnail_url: z.string().url(),
  type: z.literal("video").optional(),
});

export interface OEmbedResult {
  title: string;
  authorName: string;
  thumbnailUrl: string;
}

export class OEmbedError extends Error {
  constructor(message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = "OEmbedError";
  }
}

/**
 * Fetches YouTube oEmbed metadata for an 11-char ID with strict SSRF defenses:
 * - Fixed URL constructed solely from validated 11-char ID
 * - Redirects disabled (redirect: "error")
 * - 5-second timeout via AbortController
 * - 64 KB body size limit
 * - Content-Type validation
 * - Zod schema verification
 * - Safe generic error messages (never exposing raw upstream errors)
 */
export async function fetchOEmbed(youtubeId: string): Promise<OEmbedResult> {
  if (!/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
    throw new OEmbedError("Invalid YouTube video ID format.", 400);
  }

  const canonicalWatchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
  const targetUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    canonicalWatchUrl
  )}&format=json`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "GuruOmDental-EmbedBot/1.0",
      },
      redirect: "error", // Never follow redirects
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      logger.warn(`oEmbed request timed out for video ${youtubeId}`);
      throw new OEmbedError("YouTube could not be reached, try again.", 504);
    }
    logger.warn(`oEmbed fetch network error for video ${youtubeId}:`, err);
    throw new OEmbedError("YouTube could not be reached, try again.", 502);
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 404) {
    throw new OEmbedError("Video not found on YouTube.", 404);
  }

  if (response.status === 401 || response.status === 403) {
    throw new OEmbedError("This video is private or can't be embedded.", 403);
  }

  if (!response.ok) {
    logger.warn(`oEmbed HTTP ${response.status} for video ${youtubeId}`);
    throw new OEmbedError("YouTube could not be reached, try again.", 502);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new OEmbedError("Unexpected response format received from YouTube.", 502);
  }

  // Enforce 64 KB body size cap safely via stream reader
  if (!response.body) {
    throw new OEmbedError("Empty response received from YouTube.", 502);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  const MAX_BYTES = 64 * 1024; // 64 KB

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.length;
        if (totalBytes > MAX_BYTES) {
          await reader.cancel();
          throw new OEmbedError("YouTube metadata payload exceeded safety limit.", 502);
        }
        chunks.push(value);
      }
    }
  } catch (err) {
    if (err instanceof OEmbedError) throw err;
    throw new OEmbedError("Failed reading metadata response from YouTube.", 502);
  }

  const totalBuffer = Buffer.concat(chunks);
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(totalBuffer.toString("utf-8"));
  } catch {
    throw new OEmbedError("Failed to parse YouTube metadata as JSON.", 502);
  }

  const validated = oembedSchema.safeParse(parsedJson);
  if (!validated.success) {
    logger.warn("oEmbed schema mismatch:", validated.error.issues);
    throw new OEmbedError("Invalid metadata structure returned from YouTube.", 502);
  }

  return {
    title: validated.data.title.trim(),
    authorName: validated.data.author_name.trim(),
    thumbnailUrl: validated.data.thumbnail_url,
  };
}

import crypto from "node:crypto";
import { getDb } from "@/src/db/client";
import { rateLimits } from "@/src/db/schema";
import { eq, and, sql, lt } from "drizzle-orm";

export interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
}

export const RATE_LIMIT_PROFILES: Record<string, RateLimitConfig> = {
  contact: { limit: 5, windowSeconds: 10 * 60 }, // 5 submissions per 10 mins
  appointment: { limit: 5, windowSeconds: 10 * 60 }, // 5 bookings per 10 mins
  newsletter: { limit: 5, windowSeconds: 10 * 60 }, // 5 subscriptions per 10 mins
  blog_query: { limit: 60, windowSeconds: 60 }, // 60 queries per 1 min
  csp_report: { limit: 20, windowSeconds: 10 * 60 }, // 20 reports per 10 mins
  owner_mutation: { limit: 120, windowSeconds: 60 }, // 120 owner actions per 1 min
  owner_autosave: { limit: 40, windowSeconds: 60 }, // ~1 autosave per 1.5-2s
  owner_media_upload: { limit: 20, windowSeconds: 60 }, // 20 image uploads per 1 min
  owner_video_preview: { limit: 10, windowSeconds: 60 }, // 10 oEmbed link checks per 1 min
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

function getSalt(): string {
  return (
    process.env.RATE_LIMIT_SALT ||
    process.env.BETTER_AUTH_SECRET ||
    "guruom-default-salt-key-9f8a2c1"
  );
}

/**
 * Derives a privacy-preserving salted SHA-256 hash of the client identifier (IP address).
 * Raw IP addresses are NEVER stored in the database rate-limit table.
 */
export function hashClientIp(ip: string): string {
  const cleanIp = ip.trim().toLowerCase();
  return crypto
    .createHmac("sha256", getSalt())
    .update(`rate-limit:${cleanIp}`)
    .digest("hex");
}

/**
 * Checks and updates rate limit counters in the PostgreSQL rate_limits table.
 * Adheres to "fail closed" policy: if the database is unreachable, throws an error
 * to prevent attackers from bypassing protection during network glitches.
 */
export async function checkRateLimit(
  bucket: string,
  clientIp: string,
  customConfig?: RateLimitConfig
): Promise<RateLimitResult> {
  const config = customConfig || RATE_LIMIT_PROFILES[bucket] || {
    limit: 10,
    windowSeconds: 60,
  };

  const db = getDb();
  if (!db) {
    // Fail-closed guarantee
    throw new Error("Rate limiting service unavailable (Database offline).");
  }

  const keyHash = hashClientIp(clientIp);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.windowSeconds * 1000);

  // 1. Query existing rate limit record
  const existing = await db
    .select()
    .from(rateLimits)
    .where(and(eq(rateLimits.keyHash, keyHash), eq(rateLimits.bucket, bucket)))
    .limit(1);

  if (existing.length === 0) {
    // First request in this window
    await db
      .insert(rateLimits)
      .values({
        keyHash,
        bucket,
        count: 1,
        windowStart: now,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: [rateLimits.keyHash, rateLimits.bucket],
        set: {
          count: sql`${rateLimits.count} + 1`,
          expiresAt,
        },
      });

    return {
      allowed: true,
      remaining: config.limit - 1,
      retryAfterSeconds: 0,
    };
  }

  const record = existing[0];

  // If previous window expired, reset counter
  if (record.expiresAt.getTime() <= now.getTime()) {
    await db
      .update(rateLimits)
      .set({
        count: 1,
        windowStart: now,
        expiresAt,
      })
      .where(and(eq(rateLimits.keyHash, keyHash), eq(rateLimits.bucket, bucket)));

    return {
      allowed: true,
      remaining: config.limit - 1,
      retryAfterSeconds: 0,
    };
  }

  // Record is within active window
  if (record.count >= config.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((record.expiresAt.getTime() - now.getTime()) / 1000)
    );
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  // Increment counter
  await db
    .update(rateLimits)
    .set({
      count: sql`${rateLimits.count} + 1`,
    })
    .where(and(eq(rateLimits.keyHash, keyHash), eq(rateLimits.bucket, bucket)));

  return {
    allowed: true,
    remaining: config.limit - (record.count + 1),
    retryAfterSeconds: 0,
  };
}

/**
 * Deletes expired rate-limit records from the database.
 * Executed during periodic maintenance jobs.
 */
export async function cleanupRateLimits(): Promise<number> {
  const db = getDb();
  if (!db) return 0;

  const now = new Date();
  const deleted = await db
    .delete(rateLimits)
    .where(lt(rateLimits.expiresAt, now))
    .returning({ keyHash: rateLimits.keyHash });

  return deleted.length;
}

/**
 * ============================================================================
 * SHARED IN-MEMORY RATE LIMITER
 * ============================================================================
 * NOTE FOR PRODUCTION:
 * This in-memory store is suitable for single-instance / development environments.
 * When deploying across multiple serverless nodes or Edge containers, replace
 * this with an Upstash Redis or distributed KV store.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitBuckets = new Map<string, Map<string, RateLimitRecord>>();

/**
 * Checks if a client IP has exceeded the allowed attempts for a specific bucket.
 *
 * @param bucket - Namespace for the action (e.g. "appointment", "contact")
 * @param ip - Client IP address
 * @param maxAttempts - Maximum attempts allowed in the window (default: 6)
 * @param windowMs - Time window in milliseconds (default: 10 minutes)
 * @returns boolean - True if allowed, false if rate limited
 */
export function checkRateLimit(
  bucket: string,
  ip: string,
  maxAttempts = 6,
  windowMs = 10 * 60 * 1000
): boolean {
  if (!rateLimitBuckets.has(bucket)) {
    rateLimitBuckets.set(bucket, new Map());
  }

  const bucketMap = rateLimitBuckets.get(bucket)!;
  const now = Date.now();
  const record = bucketMap.get(ip);

  if (!record || now > record.resetAt) {
    bucketMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * Extracts the real client IP address from Next.js request headers.
 */
export function extractClientIp(headersList: { get: (name: string) => string | null }): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headersList.get("x-real-ip") || "127.0.0.1";
}

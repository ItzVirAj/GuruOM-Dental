import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLivePosts } from "@/src/server/blog/queries";

// ==============================================================================
// In-Memory Dev-Grade Rate Limiter
// ==============================================================================
// Note: In multi-instance serverless production, rate limiting should be handled
// via Redis (e.g. Upstash) or an edge proxy (e.g. Cloudflare).
// For development and single-node deployment, an in-memory window prevents spam.
// ==============================================================================
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests/min

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  return true;
}

// Clean up stale IPs periodically
if (process.env.NODE_ENV !== "test") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of ipRequestCounts.entries()) {
      if (now > entry.resetAt) {
        ipRequestCounts.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

const querySchema = z.object({
  category: z.string().max(50).optional(),
  search: z.string().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(24).default(12),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
});

/**
 * Public Read-Only Blog Pagination and Search API Endpoint
 */
export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const result = await getLivePosts({
      category: parsed.data.category,
      search: parsed.data.search,
      limit: parsed.data.limit,
      offset: parsed.data.offset,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error(
      "[Public Blog API Error]",
      error instanceof Error ? error.message : "Internal API error"
    );
    return NextResponse.json(
      { error: "Unable to fetch blog posts" },
      { status: 500 }
    );
  }
}

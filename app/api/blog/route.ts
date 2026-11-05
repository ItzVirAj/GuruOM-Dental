import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLivePosts } from "@/src/server/blog/queries";
import { checkRateLimit } from "@/src/server/security/rate-limit";
import { logger } from "@/src/lib/logger";

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

  try {
    const rateCheck = await checkRateLimit("blog_query", ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfterSeconds),
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }
  } catch (err) {
    logger.error("[BLOG_RATE_LIMIT_ERROR]", err);
    return NextResponse.json(
      { error: "Rate limiting service temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
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
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    logger.error(
      "[Public Blog API Error]",
      error instanceof Error ? error.message : "Internal API error"
    );
    return NextResponse.json(
      { error: "Unable to fetch blog posts" },
      { status: 500, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  }
}

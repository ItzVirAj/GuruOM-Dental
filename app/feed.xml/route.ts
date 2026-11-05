import { NextResponse } from "next/server";
import { getLivePosts } from "@/src/server/blog/queries";
import { buildRssFeed } from "@/src/lib/rss";
import { siteConfig } from "@/data/site";

export async function GET() {
  try {
    const { posts } = await getLivePosts({ limit: 20 });
    const xml = buildRssFeed(posts, siteConfig);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("[RSS Feed Error]", err);
    // Return minimal valid RSS empty channel on failure
    const fallbackXml = buildRssFeed([], siteConfig);
    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }
}

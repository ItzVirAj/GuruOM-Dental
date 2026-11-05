import { siteConfig } from "@/data/site";
import type { PublicBlogPost } from "@/src/server/blog/types";

/**
 * Strips XML 1.0 disallowed control characters:
 * #x00-#x08, #x0B-#x0C, #x0E-#x1F
 */
export function stripXmlControlChars(str: string): string {
  if (!str) return "";
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

/**
 * Escapes characters for safe inclusion in XML elements or attributes.
 */
export function escapeXml(str: string): string {
  if (!str) return "";
  const cleaned = stripXmlControlChars(str);
  return cleaned
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Formats a date into RFC 822 GMT format (e.g. "Mon, 02 Mar 2026 00:00:00 GMT").
 */
export function formatRfc822Date(input: Date | string | number): string {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) {
    return new Date().toUTCString();
  }
  return d.toUTCString();
}

/**
 * Generates valid RSS 2.0 XML with atom:link self from a list of public posts.
 */
export function buildRssFeed(
  posts: PublicBlogPost[],
  site = siteConfig
): string {
  const feedUrl = `${site.url}/feed.xml`;
  const blogUrl = `${site.url}/blog`;
  const lastBuildDate = formatRfc822Date(new Date());

  const itemsXml = posts
    .map((post) => {
      const postUrl = `${site.url}/blog/${escapeXml(post.slug)}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${formatRfc822Date(post.publishedAt)}</pubDate>
      ${post.authorName ? `<author>${escapeXml(post.authorName)}</author>` : ""}
      ${post.categoryLabel ? `<category>${escapeXml(post.categoryLabel)}</category>` : ""}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)} Dental Journal</title>
    <link>${blogUrl}</link>
    <description>${escapeXml(site.tagline)}</description>
    <language>en-IN</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;
}

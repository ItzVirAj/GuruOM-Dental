import "server-only";

import { unstable_cache } from "next/cache";
import { eq, and, desc, asc, sql, ilike, or, lt, gt } from "drizzle-orm";
import { getDb } from "@/src/db";
import { posts, categories, tags, postTags } from "@/src/db/schema";
import { isPostLiveCondition } from "./live";
import { BLOG_CACHE_TAG, BLOG_REVALIDATE_SECONDS } from "./revalidate";
import type { PublicBlogPost, PublicCategory } from "./types";
import type { ContentBlock } from "@/src/lib/blog-content";

function cachedQuery<T>(
  queryFn: () => Promise<T>,
  keyParts: string[]
): Promise<T> {
  if (process.env.NODE_ENV === "development") {
    // In local development, bypass cache so DB updates and seeds reflect immediately
    return queryFn();
  }
  return unstable_cache(queryFn, keyParts, {
    tags: [BLOG_CACHE_TAG],
    revalidate: BLOG_REVALIDATE_SECONDS,
  })();
}

function escapeLikeString(str: string): string {
  return str.slice(0, 80).replace(/[%_\\]/g, "\\$&");
}

function mapRowToPublicBlogPost(
  row: typeof posts.$inferSelect,
  tagList: string[] = [],
  catLabel?: string
): PublicBlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.categorySlug,
    categoryLabel: catLabel,
    publishedAt: row.publishAt
      ? row.publishAt.toISOString().slice(0, 10)
      : row.createdAt.toISOString().slice(0, 10),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString().slice(0, 10) : undefined,
    authorName: row.authorName,
    authorRole: row.authorRole,
    reviewedBySlug: row.reviewedByDoctorSlug,
    tags: tagList,
    coverSlot: row.coverSlot,
    coverImageUrl: row.coverImageUrl,
    coverImageAlt: row.coverImageAlt,
    featured: row.featured,
    relatedServiceSlug: row.relatedServiceSlug,
    readingTimeMinutes: row.readingTimeMinutes,
    content: (row.content as ContentBlock[]) || [],
  };
}

/**
 * Fetch all tags for a list of post IDs.
 */
async function fetchTagsForPosts(
  db: NonNullable<ReturnType<typeof getDb>>,
  postIds: string[]
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (postIds.length === 0) return map;

  try {
    const rows = await db
      .select({
        postId: postTags.postId,
        tagLabel: tags.label,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagSlug, tags.slug))
      .where(sql`${postTags.postId} IN ${postIds}`);

    for (const r of rows) {
      const list = map.get(r.postId) || [];
      list.push(r.tagLabel);
      map.set(r.postId, list);
    }
  } catch (error) {
    console.warn(
      "[Blog Tags Query] Failed to fetch tags for posts:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }

  return map;
}

export interface GetLivePostsParams {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Retrieves public blog posts with filtering, search, and pagination.
 */
export async function getLivePosts(
  params: GetLivePostsParams = {}
): Promise<{ posts: PublicBlogPost[]; total: number }> {
  return cachedQuery(
    async () => {
      const db = getDb();
      if (!db) {
        console.warn("[Blog Queries] Database is unconfigured or unreachable. Returning empty posts.");
        return { posts: [], total: 0 };
      }

      try {
        const clampedLimit = Math.min(Math.max(1, params.limit ?? 12), 24);
        const clampedOffset = Math.max(0, params.offset ?? 0);

        const conditions = [isPostLiveCondition()];

        if (params.category && params.category !== "all") {
          conditions.push(eq(posts.categorySlug, params.category.trim()));
        }

        if (params.search && params.search.trim().length > 0) {
          const escaped = escapeLikeString(params.search.trim());
          const pattern = `%${escaped}%`;
          conditions.push(
            or(ilike(posts.title, pattern), ilike(posts.excerpt, pattern))!
          );
        }

        const whereClause = and(...conditions);

        // Fetch posts and category label
        const rows = await db
          .select({
            post: posts,
            categoryLabel: categories.label,
          })
          .from(posts)
          .innerJoin(categories, eq(posts.categorySlug, categories.slug))
          .where(whereClause)
          .orderBy(desc(posts.publishAt))
          .limit(clampedLimit)
          .offset(clampedOffset);

        // Count total matching
        const countResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(posts)
          .where(whereClause);

        const total = countResult[0]?.count ?? 0;

        const postIds = rows.map((r) => r.post.id);
        const tagsMap = await fetchTagsForPosts(db, postIds);

        const mappedPosts = rows.map((r) =>
          mapRowToPublicBlogPost(
            r.post,
            tagsMap.get(r.post.id) || [],
            r.categoryLabel
          )
        );

        return { posts: mappedPosts, total };
      } catch (error) {
        console.error(
          "[Blog Query Error]",
          error instanceof Error ? error.message : "Database query failed"
        );
        return { posts: [], total: 0 };
      }
    },
    ["live-posts", JSON.stringify(params)]
  );
}

/**
 * Retrieves a single public blog post by unique slug.
 * Returns null if the post does not exist, is soft-deleted, is draft, or is future-scheduled.
 */
export async function getLivePostBySlug(
  slug: string
): Promise<PublicBlogPost | null> {
  return cachedQuery(
    async () => {
      const db = getDb();
      if (!db || !slug) return null;

      try {
        const rows = await db
          .select({
            post: posts,
            categoryLabel: categories.label,
          })
          .from(posts)
          .innerJoin(categories, eq(posts.categorySlug, categories.slug))
          .where(and(eq(posts.slug, slug), isPostLiveCondition()))
          .limit(1);

        if (rows.length === 0) return null;

        const r = rows[0];
        const tagsMap = await fetchTagsForPosts(db, [r.post.id]);

        return mapRowToPublicBlogPost(
          r.post,
          tagsMap.get(r.post.id) || [],
          r.categoryLabel
        );
      } catch (error) {
        console.error(
          "[Blog Slug Query Error]",
          error instanceof Error ? error.message : "Database query failed"
        );
        return null;
      }
    },
    ["live-post-by-slug", slug]
  );
}

/**
 * Retrieves the single featured public blog post, or the latest post if none is designated featured.
 */
export async function getFeaturedPost(): Promise<PublicBlogPost | null> {
  return cachedQuery(
    async () => {
      const db = getDb();
      if (!db) return null;

      try {
        // First look for explicitly featured live post
        let rows = await db
          .select({
            post: posts,
            categoryLabel: categories.label,
          })
          .from(posts)
          .innerJoin(categories, eq(posts.categorySlug, categories.slug))
          .where(and(eq(posts.featured, true), isPostLiveCondition()))
          .limit(1);

        // Fallback to most recent live post if none marked featured
        if (rows.length === 0) {
          rows = await db
            .select({
              post: posts,
              categoryLabel: categories.label,
            })
            .from(posts)
            .innerJoin(categories, eq(posts.categorySlug, categories.slug))
            .where(isPostLiveCondition())
            .orderBy(desc(posts.publishAt))
            .limit(1);
        }

        if (rows.length === 0) return null;

        const r = rows[0];
        const tagsMap = await fetchTagsForPosts(db, [r.post.id]);

        return mapRowToPublicBlogPost(
          r.post,
          tagsMap.get(r.post.id) || [],
          r.categoryLabel
        );
      } catch (error) {
        console.error(
          "[Featured Post Query Error]",
          error instanceof Error ? error.message : "Database query failed"
        );
        return null;
      }
    },
    ["featured-live-post"]
  );
}

/**
 * Finds related public posts prioritizing the same category, limited to `limit` items (max 6).
 */
export async function getRelatedPosts(
  currentSlug: string,
  limit = 3
): Promise<PublicBlogPost[]> {
  return cachedQuery(
    async () => {
      const db = getDb();
      if (!db || !currentSlug) return [];

      try {
        const current = await getLivePostBySlug(currentSlug);
        if (!current) return [];

        const clampedLimit = Math.min(Math.max(1, limit), 6);

        // Fetch other posts in same category first
        const rows = await db
          .select({
            post: posts,
            categoryLabel: categories.label,
          })
          .from(posts)
          .innerJoin(categories, eq(posts.categorySlug, categories.slug))
          .where(
            and(
              isPostLiveCondition(),
              sql`${posts.slug} != ${currentSlug}`,
              eq(posts.categorySlug, current.category)
            )
          )
          .orderBy(desc(posts.publishAt))
          .limit(clampedLimit);

        // If not enough in same category, supplement with recent posts
        let finalRows = [...rows];
        if (finalRows.length < clampedLimit) {
          const needed = clampedLimit - finalRows.length;
          const excludedSlugs = [currentSlug, ...finalRows.map((r) => r.post.slug)];
          const moreRows = await db
            .select({
              post: posts,
              categoryLabel: categories.label,
            })
            .from(posts)
            .innerJoin(categories, eq(posts.categorySlug, categories.slug))
            .where(
              and(
                isPostLiveCondition(),
                sql`${posts.slug} NOT IN ${excludedSlugs}`
              )
            )
            .orderBy(desc(posts.publishAt))
            .limit(needed);

          finalRows = finalRows.concat(moreRows);
        }

        const postIds = finalRows.map((r) => r.post.id);
        const tagsMap = await fetchTagsForPosts(db, postIds);

        return finalRows.map((r) =>
          mapRowToPublicBlogPost(
            r.post,
            tagsMap.get(r.post.id) || [],
            r.categoryLabel
          )
        );
      } catch (error) {
        console.error(
          "[Related Posts Query Error]",
          error instanceof Error ? error.message : "Database query failed"
        );
        return [];
      }
    },
    ["related-posts", currentSlug, String(limit)]
  );
}

/**
 * Returns previous and next public posts chronologically for footer navigation.
 */
export async function getAdjacentPosts(
  currentSlug: string
): Promise<{ prev: PublicBlogPost | null; next: PublicBlogPost | null }> {
  return cachedQuery(
    async () => {
      const db = getDb();
      if (!db || !currentSlug) return { prev: null, next: null };

      try {
        const current = await db
          .select({ publishAt: posts.publishAt })
          .from(posts)
          .where(and(eq(posts.slug, currentSlug), isPostLiveCondition()))
          .limit(1);

        if (current.length === 0 || !current[0].publishAt) {
          return { prev: null, next: null };
        }

        const currentDate = current[0].publishAt;

        // Previous post (older)
        const prevRows = await db
          .select({
            post: posts,
            categoryLabel: categories.label,
          })
          .from(posts)
          .innerJoin(categories, eq(posts.categorySlug, categories.slug))
          .where(and(isPostLiveCondition(), lt(posts.publishAt, currentDate)))
          .orderBy(desc(posts.publishAt))
          .limit(1);

        // Next post (newer)
        const nextRows = await db
          .select({
            post: posts,
            categoryLabel: categories.label,
          })
          .from(posts)
          .innerJoin(categories, eq(posts.categorySlug, categories.slug))
          .where(and(isPostLiveCondition(), gt(posts.publishAt, currentDate)))
          .orderBy(asc(posts.publishAt))
          .limit(1);

        const prevId = prevRows[0]?.post.id;
        const nextId = nextRows[0]?.post.id;
        const ids = [prevId, nextId].filter(Boolean) as string[];
        const tagsMap = await fetchTagsForPosts(db, ids);

        const prev = prevRows[0]
          ? mapRowToPublicBlogPost(
              prevRows[0].post,
              tagsMap.get(prevRows[0].post.id) || [],
              prevRows[0].categoryLabel
            )
          : null;

        const next = nextRows[0]
          ? mapRowToPublicBlogPost(
              nextRows[0].post,
              tagsMap.get(nextRows[0].post.id) || [],
              nextRows[0].categoryLabel
            )
          : null;

        return { prev, next };
      } catch (error) {
        console.error(
          "[Adjacent Posts Query Error]",
          error instanceof Error ? error.message : "Database query failed"
        );
        return { prev: null, next: null };
      }
    },
    ["adjacent-posts", currentSlug]
  );
}

/**
 * Returns all categories with active public post counts, sorted by sort_order.
 */
export async function getCategoriesWithCounts(): Promise<PublicCategory[]> {
  return cachedQuery(
    async () => {
      const db = getDb();
      if (!db) return [];

      try {
        const catRows = await db
          .select({
            slug: categories.slug,
            label: categories.label,
            sortOrder: categories.sortOrder,
          })
          .from(categories)
          .orderBy(asc(categories.sortOrder));

        // Aggregate count of live posts per category
        const counts = await db
          .select({
            categorySlug: posts.categorySlug,
            count: sql<number>`count(*)::int`,
          })
          .from(posts)
          .where(isPostLiveCondition())
          .groupBy(posts.categorySlug);

        const countMap = new Map(counts.map((c) => [c.categorySlug, c.count]));

        return catRows.map((cat) => ({
          slug: cat.slug,
          label: cat.label,
          sortOrder: cat.sortOrder,
          count: countMap.get(cat.slug) ?? 0,
        }));
      } catch (error) {
        console.error(
          "[Categories Query Error]",
          error instanceof Error ? error.message : "Database query failed"
        );
        return [];
      }
    },
    ["categories-with-counts"]
  );
}

/**
 * Returns all live slugs and updated timestamps for generateStaticParams and sitemap.
 */
export async function getAllLiveSlugs(): Promise<
  Array<{ slug: string; updatedAt?: string }>
> {
  return cachedQuery(
    async () => {
      const db = getDb();
      if (!db) {
        console.warn("[Blog Queries] Database unconfigured. Returning empty slug list for static build.");
        return [];
      }

      try {
        const rows = await db
          .select({
            slug: posts.slug,
            updatedAt: posts.updatedAt,
            publishAt: posts.publishAt,
          })
          .from(posts)
          .where(isPostLiveCondition())
          .orderBy(desc(posts.publishAt));

        return rows.map((r) => ({
          slug: r.slug,
          updatedAt: (r.updatedAt || r.publishAt)?.toISOString(),
        }));
      } catch (error) {
        console.warn(
          "[Blog Slugs Query Warning] Unable to fetch static slugs:",
          error instanceof Error ? error.message : "Database unreachable"
        );
        return [];
      }
    },
    ["all-live-slugs"]
  );
}

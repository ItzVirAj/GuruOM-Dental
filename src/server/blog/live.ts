import { sql, and, isNull, inArray, lte } from "drizzle-orm";
import { posts } from "@/src/db/schema";

/**
 * The single source of truth for public post visibility.
 * A post is visible to the public if and only if:
 * 1. It is not soft-deleted: deleted_at IS NULL
 * 2. Its status is 'published' or 'scheduled'
 * 3. Its publish_at timestamp is in the past: publish_at <= now()
 *
 * Drafts and archived posts are never public.
 * Scheduled posts become visible automatically the instant their publish_at arrives.
 */
export function isPostLiveCondition() {
  return and(
    isNull(posts.deletedAt),
    inArray(posts.status, ["published", "scheduled"]),
    lte(posts.publishAt, sql`now()`)
  );
}

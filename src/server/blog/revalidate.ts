import { revalidatePath, revalidateTag } from "next/cache";

export const BLOG_CACHE_TAG = "blog";
export const BLOG_REVALIDATE_SECONDS = 300; // 5 minutes

/**
 * Revalidates public blog caches across all paths and tags.
 * Called after creating, publishing, updating, or deleting a blog post.
 */
export async function revalidateBlog(slug?: string): Promise<void> {
  try {
    revalidateTag(BLOG_CACHE_TAG, "max-age");
  } catch {
    // If cache API is invoked outside an active request context, fall back silently
  }

  try {
    revalidatePath("/blog");
    revalidatePath("/sitemap.xml");
    if (slug) {
      revalidatePath(`/blog/${slug}`);
    }
  } catch (error) {
    console.error(
      "[Blog Cache Revalidation]",
      error instanceof Error ? error.message : "Cache revalidation failed"
    );
  }
}

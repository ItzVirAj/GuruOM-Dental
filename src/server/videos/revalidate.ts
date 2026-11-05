import { revalidatePath, revalidateTag } from "next/cache";

export const VIDEOS_CACHE_TAG = "videos";

/**
 * Revalidates public video and blog caches across tags and paths.
 * Called whenever video metadata, status, thumbnail, or ordering changes.
 */
export async function revalidateVideos(slug?: string): Promise<void> {
  try {
    revalidateTag(VIDEOS_CACHE_TAG, "max");
  } catch {
    // Fall back silently if outside active request
  }

  try {
    revalidatePath("/videos");
    revalidatePath("/blog");
    revalidatePath("/sitemap.xml");
    if (slug) {
      revalidatePath(`/videos/${slug}`);
    }
  } catch (error) {
    console.error(
      "[Videos Cache Revalidation]",
      error instanceof Error ? error.message : "Cache revalidation failed"
    );
  }
}


import React from "react";
import { getLivePosts } from "@/src/server/blog/queries";
import { getLiveVideos, PublicVideoDTO } from "@/src/server/videos/queries";
import type { PublicBlogPost } from "@/src/server/blog/types";
import { LatestJournalClient } from "./LatestJournalClient";

export async function LatestJournal() {
  let posts: PublicBlogPost[] = [];
  let video: PublicVideoDTO | null = null;

  try {
    const [{ posts: fetchedPosts }, { items: videoItems }] = await Promise.all([
      getLivePosts({ limit: 3 }),
      getLiveVideos({ limit: 1 }),
    ]);

    posts = fetchedPosts;
    video = videoItems.length > 0 ? videoItems[0] : null;
  } catch (error) {
    console.warn("[LatestJournal] Failed to fetch journal or video data:", error);
    return null;
  }

  if (posts.length === 0 && !video) {
    return null;
  }

  return <LatestJournalClient posts={posts} video={video} />;
}

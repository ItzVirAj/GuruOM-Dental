"use server";

import { getLiveVideos, PublicVideoDTO } from "@/src/server/videos/queries";

export async function loadMoreVideosAction(options: {
  category?: string;
  offset: number;
  limit?: number;
}): Promise<{ items: PublicVideoDTO[]; hasMore: boolean }> {
  const limit = Math.min(24, Math.max(1, options.limit || 12));
  const offset = Math.max(0, options.offset || 0);
  const cleanCategory =
    options.category && options.category !== "all" ? options.category : undefined;

  const { items, total } = await getLiveVideos({
    category: cleanCategory,
    limit,
    offset,
  });

  return {
    items,
    hasMore: offset + items.length < total,
  };
}


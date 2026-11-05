"use client";

import { useState, useTransition, useId } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Play, Loader2, Video as VideoIcon } from "lucide-react";
import type { PublicVideoDTO } from "@/src/server/videos/queries";
import type { PublicCategory } from "@/src/server/blog/types";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";
import { loadMoreVideosAction } from "@/app/videos/actions";

export interface VideosGridProps {
  initialVideos: PublicVideoDTO[];
  categories: PublicCategory[];
  initialCategory?: string;
  totalCount: number;
}

export function VideosGrid({
  initialVideos,
  categories,
  initialCategory = "all",
  totalCount,
}: VideosGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [videosList, setVideosList] = useState<PublicVideoDTO[]>(initialVideos);
  const [hasMore, setHasMore] = useState(initialVideos.length < totalCount);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const filterGroupId = useId();

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    const newQuery = params.toString() ? `?${params.toString()}` : "";

    startTransition(async () => {
      router.push(`/videos${newQuery}`, { scroll: false });
      const res = await loadMoreVideosAction({
        category: slug,
        offset: 0,
        limit: 12,
      });
      setVideosList(res.items);
      setHasMore(res.hasMore);
    });
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const res = await loadMoreVideosAction({
        category: selectedCategory,
        offset: videosList.length,
        limit: 12,
      });
      setVideosList((prev) => [...prev, ...res.items]);
      setHasMore(res.hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <section className="py-12 sm:py-16" aria-labelledby="videos-catalog-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-line/60">
          <div>
            <h2
              id="videos-catalog-heading"
              className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight"
            >
              All Video Guides
            </h2>
            <p className="text-sm text-ink-muted mt-1 font-body">
              Browse procedures, specialist hygiene advice, and patient explanations.
            </p>
          </div>

          {/* Accessible Category Filter Pills */}
          <div
            id={filterGroupId}
            role="toolbar"
            aria-label="Filter videos by clinical topic"
            className="flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              onClick={() => handleCategorySelect("all")}
              aria-pressed={selectedCategory === "all"}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                selectedCategory === "all"
                  ? "bg-brand text-white shadow-sm"
                  : "bg-surface hover:bg-black/5 text-ink-muted hover:text-ink border border-line"
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                aria-pressed={selectedCategory === cat.slug}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  selectedCategory === cat.slug
                    ? "bg-brand text-white shadow-sm"
                    : "bg-surface hover:bg-black/5 text-ink-muted hover:text-ink border border-line"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Video Grid or Empty State */}
        {isPending ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto mb-3" />
            <p className="text-sm text-ink-muted">Loading videos...</p>
          </div>
        ) : videosList.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-paper-sunken border border-line flex items-center justify-center mx-auto mb-4">
              <VideoIcon className="w-8 h-8 text-ink-muted/50" />
            </div>
            <h3 className="font-display font-semibold text-lg text-ink">
              No videos found in this topic
            </h3>
            <p className="text-sm text-ink-muted mt-2">
              We regularly publish new treatment demonstrations. Try selecting another topic above.
            </p>
            <button
              type="button"
              onClick={() => handleCategorySelect("all")}
              className="mt-6 px-5 py-2.5 bg-brand text-white rounded-full text-sm font-medium hover:bg-brand-accent transition-colors"
            >
              View All Videos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-8">
            {videosList.map((video) => (
              <Link
                key={video.id}
                href={`/videos/${video.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden border border-line/80 bg-surface shadow-xs hover:shadow-card hover:border-brand/40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {/* 16:9 Thumbnail Box */}
                <div className="relative aspect-video w-full bg-ink/90 overflow-hidden">
                  {video.thumbnail?.url ? (
                    <Image
                      loader={cloudinaryLoader}
                      src={video.thumbnail.url}
                      alt={video.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transform transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none"
                      placeholder={video.thumbnail.blur ? "blur" : "empty"}
                      blurDataURL={video.thumbnail.blur}
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-ink/90 to-ink/70 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white/30" />
                    </div>
                  )}

                  {/* Play badge overlay */}
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-brand/90 group-hover:bg-brand text-white flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-transform motion-reduce:transform-none">
                      <Play className="w-5 h-5 translate-x-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Category pill */}
                  {video.categoryLabel && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
                      {video.categoryLabel}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-base sm:text-lg text-ink group-hover:text-brand transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-muted mt-2 line-clamp-2 font-body leading-relaxed">
                      {video.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs text-ink-muted">
                    <span className="font-medium text-brand group-hover:underline">
                      Watch Video →
                    </span>
                    {video.uploadedOn && <span>{video.uploadedOn}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !isPending && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface border border-line text-sm font-medium text-ink hover:bg-black/5 hover:border-brand/40 transition-colors disabled:opacity-50 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-brand" />
                  Loading more...
                </>
              ) : (
                "Load More Videos"
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

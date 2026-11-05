"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Calendar, Play, BookOpen, Video } from "lucide-react";
import type { PublicBlogPost } from "@/src/server/blog/types";
import type { PublicVideoDTO } from "@/src/server/videos/queries";
import { formatDate } from "@/src/lib/blog-format";
import { SmartImage } from "@/components/ui/SmartImage";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { VideoFacade } from "@/components/video/VideoFacade";

export interface LatestJournalClientProps {
  posts: PublicBlogPost[];
  video: PublicVideoDTO | null;
}

export const LatestJournalClient: React.FC<LatestJournalClientProps> = ({
  posts,
  video,
}) => {
  if (posts.length === 0 && !video) return null;

  const [leadPost, ...secondaryPosts] = posts;

  return (
    <section
      aria-labelledby="home-journal-heading"
      className="py-16 sm:py-20 md:py-24 bg-white border-b border-line"
    >
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">
              Clinical Insights
            </span>
            <h2
              id="home-journal-heading"
              className="text-display-md sm:text-display-lg font-display text-ink tracking-tight mt-1"
            >
              From our journal.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-ink-muted leading-relaxed">
              Clear, evidence-backed guides to oral health, restorative precision, and smile care from our Ahilyanagar specialists.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explore all articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {video && (
              <Link
                href="/videos"
                className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-brand transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video gallery</span>
              </Link>
            )}
          </div>
        </div>

        {/* Content Layout */}
        <div
          className={`grid grid-cols-1 ${
            video ? "lg:grid-cols-12 gap-8 lg:gap-10" : "gap-8"
          }`}
        >
          {/* Left / Main Posts Column */}
          <div
            className={
              video
                ? "lg:col-span-7 xl:col-span-7 flex flex-col gap-6"
                : "grid grid-cols-1 md:grid-cols-3 gap-6"
            }
          >
            {/* 1 Large Lead Post */}
            {leadPost && (
              <article
                className={`group flex flex-col rounded-3xl bg-surface/40 border border-line overflow-hidden shadow-soft transition-all duration-300 hover:shadow-card hover:border-brand/40 ${
                  video ? "" : "md:col-span-2"
                }`}
              >
                <Link
                  href={`/blog/${leadPost.slug}`}
                  className="flex flex-col flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-alt">
                    {leadPost.coverMedia ? (
                      <Image
                        loader={cloudinaryLoader}
                        src={leadPost.coverMedia.publicId}
                        alt={leadPost.coverAltOverride || leadPost.coverMedia.alt || leadPost.title}
                        fill
                        placeholder={leadPost.coverMedia.blurDataUrl ? "blur" : "empty"}
                        blurDataURL={leadPost.coverMedia.blurDataUrl || undefined}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    ) : leadPost.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={leadPost.coverImageUrl}
                        alt={leadPost.coverImageAlt || leadPost.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    ) : leadPost.coverSlot ? (
                      <SmartImage
                        slot={leadPost.coverSlot}
                        alt={leadPost.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-muted/30">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                    {leadPost.categoryLabel && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge variant="accent" size="sm">
                          {leadPost.categoryLabel}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-ink-muted mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(leadPost.publishedAt)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {leadPost.readingTimeMinutes || 5} min read
                        </span>
                      </div>
                      <h3 className="text-display-xs sm:text-display-sm font-display text-ink group-hover:text-brand transition-colors line-clamp-2">
                        {leadPost.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-ink-muted line-clamp-2 leading-relaxed">
                        {leadPost.excerpt}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
                      <span className="text-xs text-ink-muted">
                        By {leadPost.authorName}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand group-hover:translate-x-0.5 transition-transform">
                        <span>Read guide</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            )}

            {/* Compact Secondary Posts */}
            {secondaryPosts.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col sm:flex-row items-center rounded-2xl bg-surface/30 border border-line overflow-hidden p-3 sm:p-4 gap-4 shadow-soft transition-all duration-300 hover:shadow-card hover:border-brand/40"
              >
                <div className="relative w-full sm:w-36 h-28 shrink-0 rounded-xl overflow-hidden bg-surface-alt">
                  {post.coverMedia ? (
                    <Image
                      loader={cloudinaryLoader}
                      src={post.coverMedia.publicId}
                      alt={post.coverAltOverride || post.coverMedia.alt || post.title}
                      fill
                      sizes="144px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : post.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImageUrl}
                      alt={post.coverImageAlt || post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : post.coverSlot ? (
                    <SmartImage
                      slot={post.coverSlot}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-muted/30">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 min-w-0 justify-between py-1">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-ink-muted mb-1">
                      {post.categoryLabel && (
                        <span className="font-semibold text-brand">
                          {post.categoryLabel}
                        </span>
                      )}
                      <span>•</span>
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="focus-visible:outline-none focus-visible:underline"
                    >
                      <h4 className="text-sm font-semibold font-display text-ink group-hover:text-brand transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                    </Link>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
                    <span>{post.readingTimeMinutes || 4} min read</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-brand font-semibold text-xs group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Right Column: Featured Live Video */}
          {video && (
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
              <div className="bg-surface/40 rounded-3xl p-5 sm:p-6 border border-line h-full flex flex-col justify-between shadow-soft">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold">
                      <Play className="w-3 h-3 fill-current" />
                      Featured Video
                    </span>
                    {video.categoryLabel && (
                      <span className="text-xs text-ink-muted">
                        {video.categoryLabel}
                      </span>
                    )}
                  </div>

                  <div className="rounded-2xl overflow-hidden shadow-soft mb-4">
                    <VideoFacade
                      youtubeId={video.youtubeId}
                      title={video.title}
                      thumbnail={video.thumbnail}
                      startSeconds={video.startSeconds}
                    />
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold font-display text-ink line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-ink-muted line-clamp-3 leading-relaxed">
                    {video.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-line/60 flex items-center justify-between">
                  <span className="text-xs text-ink-muted">
                    GuruOm Dental YouTube
                  </span>
                  <Link
                    href="/videos"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                  >
                    <span>View all videos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

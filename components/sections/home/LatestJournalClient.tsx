"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Clock, Calendar, Play, BookOpen, Video } from "lucide-react";
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
  const [mobileTab, setMobileTab] = useState<"articles" | "video">(
    posts.length > 0 ? "articles" : "video",
  );

  if (posts.length === 0 && !video) return null;

  const [leadPost, ...secondaryPosts] = posts;
  const hasTabs = posts.length > 0 && Boolean(video);

  return (
    <section
      aria-labelledby="home-journal-heading"
      className="py-12 sm:py-16 md:py-24 bg-white border-b border-line"
    >
      <Container>
        {/* Header */}
        <div
          className={`flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-6 ${
            hasTabs ? "mb-5 lg:mb-14" : "pb-6 border-b border-line lg:border-b-0 lg:pb-0 mb-6 lg:mb-14"
          }`}
        >
          <div className="max-w-2xl">
            <span className="text-sm font-semibold text-accent-deep lg:text-xs lg:uppercase lg:tracking-wider lg:text-brand">
              Clinical insights
            </span>
            <h2
              id="home-journal-heading"
              className="text-display-md sm:text-display-lg font-display text-ink tracking-tight mt-1"
            >
              From our journal.
            </h2>
            <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-ink-muted leading-relaxed">
              Clear, evidence-backed guides to oral health, restorative precision, and smile care from our Ahilyanagar specialists.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-4 shrink-0">
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
                className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-brand transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video gallery</span>
              </Link>
            )}
          </div>

          {/* Mobile / Tablet Switcher: Articles | Featured Video */}
          {hasTabs && (
            <div
              className="flex items-center gap-6 border-b border-line mt-2 lg:hidden"
              role="tablist"
              aria-label="Journal format"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mobileTab === "articles"}
                aria-controls="journal-articles-panel"
                onClick={() => setMobileTab("articles")}
                className={`pb-2.5 min-h-[44px] text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  mobileTab === "articles"
                    ? "border-accent text-ink"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                Articles ({posts.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mobileTab === "video"}
                aria-controls="journal-video-panel"
                onClick={() => setMobileTab("video")}
                className={`pb-2.5 min-h-[44px] text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  mobileTab === "video"
                    ? "border-accent text-ink"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                Featured Video
              </button>
            </div>
          )}
        </div>

        {/* Content Layout */}
        <div
          className={`grid grid-cols-1 ${
            video ? "lg:grid-cols-12 gap-8 lg:gap-10" : "gap-8"
          }`}
        >
          {/* Left / Main Posts Column */}
          {posts.length > 0 && (
            <div
              id="journal-articles-panel"
              className={`${
                video && mobileTab === "video" ? "hidden lg:flex" : "flex"
              } ${
                video
                  ? "lg:col-span-7 xl:col-span-7 flex-col lg:gap-6"
                  : "flex-col lg:grid lg:grid-cols-3 lg:gap-6"
              }`}
            >
              {/* 1 Large Lead Post */}
              {leadPost && (
                <article
                  className={`group flex flex-col pb-5 border-b border-line lg:pb-0 lg:rounded-3xl lg:bg-surface/40 lg:border lg:border-line overflow-hidden lg:shadow-soft transition-all duration-300 lg:hover:shadow-card lg:hover:border-brand/40 ${
                    video ? "" : "lg:col-span-2"
                  }`}
                >
                  <Link
                    href={`/blog/${leadPost.slug}`}
                    className="flex flex-col flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-alt rounded-xs lg:rounded-none border-b-[3px] border-accent lg:border-b-0">
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
                        <div className="hidden lg:block absolute top-4 left-4 z-10">
                          <Badge variant="accent" size="sm">
                            {leadPost.categoryLabel}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="pt-3.5 lg:p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted mb-2">
                          {leadPost.categoryLabel && (
                            <span className="font-semibold text-accent-deep lg:hidden">
                              {leadPost.categoryLabel}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 hidden lg:inline" aria-hidden="true" />
                            {formatDate(leadPost.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 hidden lg:inline" aria-hidden="true" />
                            {leadPost.readingTimeMinutes || 5} min read
                          </span>
                        </div>
                        <h3 className="text-display-xs sm:text-display-sm font-display text-ink group-hover:text-brand transition-colors line-clamp-2">
                          {leadPost.title}
                        </h3>
                        <p className="mt-2 text-sm text-ink-muted line-clamp-2 leading-relaxed">
                          {leadPost.excerpt}
                        </p>
                      </div>

                      <div className="hidden lg:flex mt-4 pt-3 border-t border-line/60 items-center justify-between">
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

              {/* Secondary Posts: Clean Typographic Index on mobile, Thumbnail Card on desktop */}
              {secondaryPosts.map((post) => (
                <article
                  key={post.slug}
                  className="group flex items-center justify-between gap-3.5 py-4 border-b border-line lg:rounded-2xl lg:bg-surface/30 lg:border lg:border-line lg:overflow-hidden lg:p-4 lg:gap-4 lg:shadow-soft transition-all duration-300 lg:hover:shadow-card lg:hover:border-brand/40"
                >
                  <div className="hidden lg:block relative w-36 h-28 shrink-0 rounded-xl overflow-hidden bg-surface-alt">
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

                  <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5 lg:py-1">
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs lg:text-[11px] text-ink-muted mb-1">
                        {post.categoryLabel && (
                          <span className="font-semibold text-accent-deep lg:text-brand">
                            {post.categoryLabel}
                          </span>
                        )}
                        <span className="lg:hidden">{post.readingTimeMinutes || 4} min read</span>
                        <span className="hidden lg:inline">{formatDate(post.publishedAt)}</span>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="focus-visible:outline-none focus-visible:underline"
                      >
                        <h4 className="text-[1.12rem] leading-snug lg:text-sm font-display lg:font-semibold text-ink group-hover:text-brand transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                      </Link>
                    </div>
                    <div className="hidden lg:flex mt-2 items-center justify-between text-xs text-ink-muted">
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

                  <Link
                    href={`/blog/${post.slug}`}
                    aria-label={`Read ${post.title}`}
                    className="lg:hidden w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink shrink-0"
                  >
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </article>
              ))}

              <div className="pt-5 lg:hidden">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline underline-offset-4 decoration-accent-deep"
                >
                  <span>Explore all articles</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}

          {/* Right Column: Dark Cinema Card on mobile tab, Soft Light Card on desktop */}
          {video && (
            <div
              id="journal-video-panel"
              className={`${
                posts.length > 0 && mobileTab !== "video" ? "hidden lg:flex" : "flex"
              } lg:col-span-5 xl:col-span-5 flex-col`}
            >
              <div className="bg-brand-dark text-white lg:bg-surface/40 lg:text-ink rounded-md lg:rounded-3xl p-5 sm:p-6 lg:border lg:border-line h-full flex flex-col justify-between lg:shadow-soft">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent lg:px-3 lg:py-1 lg:rounded-full lg:bg-brand/10 lg:text-brand">
                      <Play className="w-3 h-3 fill-current" />
                      Featured Video
                    </span>
                    {video.categoryLabel && (
                      <span className="text-xs text-white/65 lg:text-ink-muted">
                        {video.categoryLabel}
                      </span>
                    )}
                  </div>

                  <div className="rounded-sm lg:rounded-2xl overflow-hidden shadow-soft mb-4">
                    <VideoFacade
                      youtubeId={video.youtubeId}
                      title={video.title}
                      thumbnail={video.thumbnail}
                      startSeconds={video.startSeconds}
                    />
                  </div>

                  <h3 className="text-lg sm:text-xl lg:text-lg font-display text-white lg:text-ink lg:font-semibold line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm lg:text-xs text-white/75 lg:text-ink-muted line-clamp-3 leading-relaxed">
                    {video.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/15 lg:border-line/60 flex items-center justify-between">
                  <span className="text-xs text-white/65 lg:text-ink-muted">
                    GuruOm Dental YouTube
                  </span>
                  <Link
                    href="/videos"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent lg:text-brand hover:underline"
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

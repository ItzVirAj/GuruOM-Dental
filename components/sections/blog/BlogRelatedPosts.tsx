"use client";

import React from "react";
import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import type { BlogPost } from "@/src/server/blog/types";
import { formatDate } from "@/src/lib/blog-format";
import Image from "next/image";
import { SmartImage } from "@/components/ui/SmartImage";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";
import { Container } from "@/components/ui/Container";

export interface BlogRelatedPostsProps {
  posts: BlogPost[];
}

export const BlogRelatedPosts: React.FC<BlogRelatedPostsProps> = ({ posts }) => {
  if (posts.length === 0) return null;

  return (
    <section
      aria-labelledby="related-posts-heading"
      className="py-14 sm:py-16 bg-surface border-t border-line"
    >
      <Container>
        <div className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-line">
            <div>
              <p className="text-xs font-medium text-ink-muted">Further reading</p>
              <h3
                id="related-posts-heading"
                className="font-just-serif text-2xl sm:text-3xl font-normal text-brand-dark tracking-[-0.02em] mt-1"
              >
                Related articles
              </h3>
            </div>
            <Link
              href="/blog"
              className="text-xs font-semibold text-ink underline underline-offset-4 decoration-line hover:decoration-ink transition-colors"
            >
              Browse all journal articles
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => {
              const categoryLabel = post.categoryLabel || post.category;
              const formattedDate = formatDate(post.publishedAt);
              const readTime = post.readingTimeMinutes || 5;

              return (
                <article
                  key={post.slug}
                  className="group flex flex-col justify-between rounded-xl bg-white border border-line overflow-hidden hover:border-brand-dark/50 transition-colors"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex flex-col flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-surface-alt">
                      {post.coverMedia ? (
                        <Image
                          loader={cloudinaryLoader}
                          src={post.coverMedia.publicId}
                          alt={post.coverAltOverride || post.coverMedia.alt || post.title}
                          role={
                            post.coverMedia.decorative && !post.coverAltOverride
                              ? "presentation"
                              : undefined
                          }
                          fill
                          placeholder={post.coverMedia.blurDataUrl ? "blur" : "empty"}
                          blurDataURL={post.coverMedia.blurDataUrl || undefined}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <SmartImage
                          slot={post.coverSlot || undefined}
                          alt={post.title}
                          ratio="16/10"
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2 text-xs text-ink-muted">
                          <span>{categoryLabel || "Journal"}</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <span>{readTime} min</span>
                          </span>
                        </div>

                        <h4 className="font-just-serif font-normal text-ink text-lg leading-snug group-hover:text-accent-deep transition-colors line-clamp-2">
                          {post.title}
                        </h4>

                        <p className="mt-2 text-xs text-ink-muted line-clamp-2 leading-relaxed font-body">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-line flex items-center justify-between text-xs text-ink-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{formattedDate}</span>
                        </span>
                        <span className="font-semibold text-ink group-hover:underline underline-offset-4">
                          Read article
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};

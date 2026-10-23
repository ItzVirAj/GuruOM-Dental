"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { BlogPost, blogCategories, formatDate, readingTimeMinutes } from "@/data/blog";
import { SmartImage } from "@/components/ui/SmartImage";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";

export interface BlogRelatedPostsProps {
  posts: BlogPost[];
}

export const BlogRelatedPosts: React.FC<BlogRelatedPostsProps> = ({ posts }) => {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="related-posts-heading" className="py-14 sm:py-16 bg-surface/50 border-t border-line">
      <Container>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent block">
                Recommended Reading
              </span>
              <h3
                id="related-posts-heading"
                className="text-display-sm sm:text-display-md font-display text-ink tracking-tight mt-1"
              >
                Related Articles
              </h3>
            </div>
            <Link
              href="/blog"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline underline-offset-4"
            >
              <span>View all articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => {
              const category = blogCategories.find((c) => c.slug === post.category);
              const formattedDate = formatDate(post.publishedAt);
              const readTime = readingTimeMinutes(post);

              return (
                <article
                  key={post.slug}
                  className="group relative flex flex-col justify-between rounded-3xl bg-white border border-line overflow-hidden shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:border-brand/40"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex flex-col flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-3xl"
                  >
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-surface-alt">
                      <SmartImage
                        slot={post.coverSlot}
                        alt={post.title}
                        ratio="16/10"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>

                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {category && (
                            <Badge variant="outline" size="sm">
                              {category.label}
                            </Badge>
                          )}
                          <span className="text-[11px] text-ink-muted flex items-center gap-1">
                            <Clock className="w-3 h-3 text-brand" aria-hidden="true" />
                            <span>{readTime} min</span>
                          </span>
                        </div>

                        <h4 className="font-display font-semibold text-ink text-base tracking-tight group-hover:text-brand transition-colors line-clamp-2">
                          {post.title}
                        </h4>

                        <p className="mt-1.5 text-xs text-ink-muted line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                        <span className="text-ink-muted flex items-center gap-1.5 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-brand" />
                          <span>{formattedDate}</span>
                        </span>
                        <span className="font-semibold text-brand flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Read</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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

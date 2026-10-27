"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/src/server/blog/types";
import { formatDate } from "@/src/lib/blog-format";
import { SmartImage } from "@/components/ui/SmartImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";

export interface BlogHeroProps {
  post: BlogPost;
}

export const BlogHero: React.FC<BlogHeroProps> = ({ post }) => {
  const categoryLabel = post.categoryLabel || post.category;
  const formattedDate = formatDate(post.publishedAt);
  const readTime = post.readingTimeMinutes || 5;

  return (
    <section aria-label="Featured article" className="py-10 sm:py-12 bg-surface/50 border-b border-line">
      <Container>
        <Reveal variant="up" duration={0.7}>
          <Link
            href={`/blog/${post.slug}`}
            className="group relative block rounded-3xl bg-white border border-line p-5 sm:p-7 lg:p-8 shadow-card transition-all duration-300 hover:border-brand/40 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              {/* Image Left (~45% / 5 cols) */}
              <div className="lg:col-span-5 relative overflow-hidden rounded-2xl bg-surface-alt">
                <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <SmartImage
                    slot={post.coverSlot || undefined}
                    alt={post.title}
                    ratio="16/10"
                    priority={true}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {/* Subtle inner overlay on hover */}
                  <div className="absolute inset-0 bg-brand-dark/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              {/* Content Right (~55% / 7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent/20 text-brand-dark">
                      Featured Guide
                    </span>
                    {categoryLabel && (
                      <Badge variant="outline" size="sm">
                        {categoryLabel}
                      </Badge>
                    )}
                  </div>

                  <h2 className="text-display-sm sm:text-display-md font-display text-ink tracking-tight group-hover:text-brand transition-colors duration-200">
                    {post.title}
                  </h2>

                  <p className="mt-2.5 text-sm sm:text-body text-ink-muted line-clamp-3 leading-relaxed font-body">
                    {post.excerpt}
                  </p>
                </div>

                {/* Metadata Row & CTA */}
                <div className="pt-3 border-t border-line/60 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted font-body">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                      <span>{formattedDate}</span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                      <span>{readTime} min read</span>
                    </span>

                    <span className="hidden sm:flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                      <span>{post.authorName}</span>
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    showIcon={false}
                    className="pointer-events-none" // Anchor is the whole card
                  >
                    <span className="flex items-center gap-2">
                      <span>Read article</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
};

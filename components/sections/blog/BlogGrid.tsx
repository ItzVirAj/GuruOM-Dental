"use client";

import React, { useState, useMemo, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { Search, X, Calendar, Clock, ArrowRight, RotateCcw } from "lucide-react";
import { BlogPost, BlogCategory, formatDate, readingTimeMinutes } from "@/data/blog";
import { SmartImage } from "@/components/ui/SmartImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Flip, ScrollTrigger } from "@/lib/gsap";

export interface BlogGridProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  initialCategory?: string;
}

const PAGE_SIZE = 6;

export const BlogGrid: React.FC<BlogGridProps> = ({
  posts,
  categories,
  initialCategory = "all",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [, startTransition] = useTransition();

  const gridRef = useRef<HTMLDivElement | null>(null);
  const newlyAddedRef = useRef<HTMLAnchorElement | null>(null);

  // Debounce search input by 250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      startTransition(() => {
        setDebouncedQuery(searchQuery.trim().toLowerCase());
        setVisibleCount(PAGE_SIZE); // Reset pagination on new search
      });
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync category in URL via replaceState (no page reload, no query in search)
  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setVisibleCount(PAGE_SIZE);

    if (typeof window !== "undefined") {
      const url = slug === "all" ? "/blog" : `/blog?category=${slug}`;
      window.history.replaceState(null, "", url);
    }
  };

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 1. Category match
      const matchesCategory =
        selectedCategory === "all" || post.category === selectedCategory;

      if (!matchesCategory) return false;

      // 2. Search query match (title, excerpt, tags)
      if (!debouncedQuery) return true;

      const titleMatch = post.title.toLowerCase().includes(debouncedQuery);
      const excerptMatch = post.excerpt.toLowerCase().includes(debouncedQuery);
      const tagMatch = post.tags.some((t) => t.toLowerCase().includes(debouncedQuery));

      return titleMatch || excerptMatch || tagMatch;
    });
  }, [posts, selectedCategory, debouncedQuery]);

  // Posts visible in current page
  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  // Handle Flip animation on filter / search changes
  useEffect(() => {
    if (!gridRef.current) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      ScrollTrigger.refresh();
      return;
    }

    const cards = gridRef.current.querySelectorAll("[data-flip-card]");
    if (cards.length > 0) {
      const state = Flip.getState(cards);
      Flip.from(state, {
        duration: 0.45,
        ease: "power2.out",
        scale: true,
        fade: true,
        stagger: 0.04,
        onComplete: () => {
          ScrollTrigger.refresh();
        },
      });
    }
  }, [selectedCategory, debouncedQuery]);

  // Load More handler
  const handleLoadMore = () => {
    const nextCount = visibleCount + PAGE_SIZE;
    setVisibleCount(nextCount);

    setTimeout(() => {
      newlyAddedRef.current?.focus();
      ScrollTrigger.refresh();
    }, 60);
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setDebouncedQuery("");
    setVisibleCount(PAGE_SIZE);

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/blog");
    }
  };

  return (
    <section aria-labelledby="blog-archive-heading" className="py-12 sm:py-16 md:py-20 bg-white">
      <Container>
        {/* Section Heading & Live Filter Controls */}
        <div className="space-y-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent block">
                Articles & Clinical Guides
              </span>
              <h2
                id="blog-archive-heading"
                className="text-display-sm sm:text-display-md font-display text-ink tracking-tight mt-1"
              >
                Browse All Topics
              </h2>
            </div>

            {/* Accessible Search Input */}
            <div className="relative w-full md:w-80">
              <label htmlFor="blog-search-input" className="sr-only">
                Search dental articles by title, keyword, or tag
              </label>
              <div className="relative">
                <Search
                  className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="blog-search-input"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-full border border-line bg-surface text-sm text-ink placeholder:text-ink-muted/60 transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white hover:border-brand/40"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search query"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter Pills Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-line pb-4">
            <button
              type="button"
              onClick={() => handleCategoryChange("all")}
              aria-pressed={selectedCategory === "all"}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                selectedCategory === "all"
                  ? "bg-brand text-white shadow-soft"
                  : "bg-surface text-ink hover:bg-surface-alt border border-line"
              }`}
            >
              All Topics ({posts.length})
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              const count = posts.filter((p) => p.category === cat.slug).length;

              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleCategoryChange(cat.slug)}
                  aria-pressed={isSelected}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                    isSelected
                      ? "bg-brand text-white shadow-soft"
                      : "bg-surface text-ink hover:bg-surface-alt border border-line"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="ml-1.5 opacity-70 text-[11px]">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Live Result Announcement for Screen Readers */}
          <div aria-live="polite" className="sr-only">
            {filteredPosts.length === 1
              ? "1 article found"
              : `${filteredPosts.length} articles found`}
          </div>
        </div>

        {/* Post Grid (3 cols desktop, 2 cols tablet, 1 col mobile) */}
        {visiblePosts.length > 0 ? (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {visiblePosts.map((post, idx) => {
              const category = categories.find((c) => c.slug === post.category);
              const formattedDate = formatDate(post.publishedAt);
              const readTime = readingTimeMinutes(post);
              const isNewlyAddedAnchor = idx === visibleCount - PAGE_SIZE && visibleCount > PAGE_SIZE;

              return (
                <article
                  key={post.slug}
                  data-flip-card
                  className="group relative flex flex-col justify-between rounded-3xl bg-white border border-line overflow-hidden shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:border-brand/40"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    ref={isNewlyAddedAnchor ? newlyAddedRef : undefined}
                    className="flex flex-col flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-3xl"
                  >
                    {/* Cover Thumbnail 16/10 */}
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-surface-alt">
                      <SmartImage
                        slot={post.coverSlot}
                        alt={post.title}
                        ratio="16/10"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      {/* Subtle dark tint on hover */}
                      <div className="absolute inset-0 bg-brand-dark/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Card Content */}
                    <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                      <div>
                        {/* Category & Date */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
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

                        {/* Title */}
                        <h3 className="font-display font-semibold text-ink text-base sm:text-lg tracking-tight group-hover:text-brand transition-colors duration-200 line-clamp-2">
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Footer Row */}
                      <div className="mt-6 pt-3.5 border-t border-line/60 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-ink-muted">
                          <Calendar className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                          <span>{formattedDate}</span>
                        </span>

                        <span className="flex items-center gap-1 font-semibold text-brand transition-transform duration-200 group-hover:translate-x-1">
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
        ) : (
          /* Empty Search / Filter State */
          <div className="text-center py-16 px-4 rounded-3xl bg-surface border border-line max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-brand/10 text-brand mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-ink text-lg">
                No articles found
              </h3>
              <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                We couldn&apos;t find any posts matching &quot;{searchQuery || selectedCategory}&quot;. Try
                adjusting your keywords or clear your active filters.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              showIcon={false}
              onClick={handleClearFilters}
            >
              <span className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </span>
            </Button>
          </div>
        )}

        {/* Load More Pagination */}
        {filteredPosts.length > visibleCount && (
          <div className="mt-12 text-center">
            <Button
              type="button"
              variant="ghost"
              size="md"
              showIcon={false}
              onClick={handleLoadMore}
            >
              <span>
                Load More Articles ({filteredPosts.length - visibleCount} remaining)
              </span>
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
};

import type { ContentBlock } from "@/src/lib/blog-content";

export interface PublicCategory {
  slug: string;
  label: string;
  sortOrder: number;
  count?: number;
}

/**
 * Public Data Transfer Object (DTO) for blog posts.
 * Strictly omits deleted_at, internal database IDs, and revision history.
 */
export interface PublicBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string; // Category slug (preserves full compatibility with existing components)
  categoryLabel?: string;
  publishedAt: string; // ISO date string
  updatedAt?: string;
  authorName: string;
  authorRole: string;
  reviewedBySlug?: string | null;
  tags: string[];
  coverSlot?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  featured: boolean;
  relatedServiceSlug?: string | null;
  readingTimeMinutes: number;
  content: ContentBlock[];
}

// Alias BlogPost to PublicBlogPost for clean compatibility across existing blog components
export type BlogPost = PublicBlogPost;
export type BlogCategory = PublicCategory;

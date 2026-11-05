import { z } from "zod";
import {
  blogContentArraySchema,
  normalizeText,
} from "../../../lib/blog-content";
import { isValidSlugFormat, isSlugReserved } from "./slug";

export const tagSchema = z
  .string()
  .min(1, "Tag cannot be empty")
  .max(30, "Tag cannot exceed 30 characters")
  .transform(normalizeText);

export const postEditorDataSchema = z.object({
  title: z
    .string()
    .max(160, "Title cannot exceed 160 characters")
    .transform(normalizeText)
    .default(""),
  excerpt: z
    .string()
    .max(320, "Excerpt cannot exceed 320 characters")
    .transform(normalizeText)
    .default(""),
  content: blogContentArraySchema,
  categorySlug: z.string().min(1, "Category is required"),
  authorName: z
    .string()
    .max(100, "Author name cannot exceed 100 characters")
    .transform(normalizeText)
    .default(""),
  authorRole: z
    .string()
    .max(100, "Author role cannot exceed 100 characters")
    .transform(normalizeText)
    .default(""),
  reviewedByDoctorSlug: z.string().nullable().optional(),
  relatedServiceSlug: z.string().nullable().optional(),
  seoTitle: z
    .string()
    .max(160, "SEO title cannot exceed 160 characters")
    .transform(normalizeText)
    .nullable()
    .optional(),
  seoDescription: z
    .string()
    .max(320, "SEO description cannot exceed 320 characters")
    .transform(normalizeText)
    .nullable()
    .optional(),
  featured: z.boolean().optional().default(false),
  slug: z.string().optional(),
  tags: z
    .array(tagSchema)
    .max(8, "Cannot have more than 8 tags")
    .optional()
    .default([]),
  coverSlot: z.string().nullable().optional(),
  coverMediaId: z.string().uuid().nullable().optional(),
  coverAltOverride: z.string().max(200).nullable().optional(),
});

export type PostEditorData = z.infer<typeof postEditorDataSchema>;

/**
 * Validates that all prerequisites for publishing a post are met:
 * non-empty title, excerpt, at least one content block, category, and valid unreserved slug.
 */
export function validatePostForPublishing(data: {
  title?: string | null;
  excerpt?: string | null;
  content?: unknown;
  categorySlug?: string | null;
  slug?: string | null;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || !data.title.trim() || data.title.trim() === "Untitled Draft") {
    errors.push("Title is required before publishing.");
  }

  if (!data.excerpt || !data.excerpt.trim()) {
    errors.push("Excerpt is required before publishing.");
  }

  if (!data.categorySlug || !data.categorySlug.trim()) {
    errors.push("Category must be selected before publishing.");
  }

  if (!data.slug || !isValidSlugFormat(data.slug) || isSlugReserved(data.slug)) {
    errors.push("A valid, non-reserved URL slug is required before publishing.");
  }

  const contentParsed = blogContentArraySchema.safeParse(data.content);
  if (!contentParsed.success || contentParsed.data.length === 0) {
    errors.push("At least one content block is required before publishing.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

import { z } from "zod";

/**
 * Normalizes text to Unicode NFC and strips ASCII/Unicode control characters
 * except standard whitespace (newlines, tabs, spaces).
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .normalize("NFC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");
}

/**
 * Strict protocol and target link validation.
 * Allowed: https:, mailto:, tel:, relative same-site paths (/...), and anchors (#...).
 * Strictly rejected: javascript:, data:, vbscript:, http:, protocol-relative (//), and control characters.
 */
export function isSafeLink(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();

  // Reject control characters
  if (/[\u0000-\u001F\u007F-\u009F]/.test(trimmed)) return false;

  // Disallow dangerous or insecure schemes
  if (/^(javascript|data|vbscript|http):/i.test(trimmed)) return false;

  // Disallow protocol-relative URLs (e.g. //attacker.com)
  if (trimmed.startsWith("//")) return false;

  // Allow https:, mailto:, tel:
  if (/^(https:\/\/|mailto:|tel:)/i.test(trimmed)) return true;

  // Allow same-site relative paths and anchors
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;

  return false;
}

export const safeLinkSchema = z
  .string()
  .max(1000, "URL cannot exceed 1000 characters")
  .refine(isSafeLink, {
    message: "Link must use https://, mailto:, tel:, or a relative path (/...)",
  });

export const inlineMarkSchema = z.enum(["bold", "italic"]);
export type InlineMark = z.infer<typeof inlineMarkSchema>;

export const inlineRunSchema = z.object({
  text: z.string().transform(normalizeText),
  marks: z.array(inlineMarkSchema).optional(),
  href: safeLinkSchema.optional(),
});
export type InlineRun = z.infer<typeof inlineRunSchema>;

/**
 * Extracts plain text from inline runs or legacy string.
 */
export function extractTextFromRuns(input: InlineRun[] | string | undefined): string {
  if (!input) return "";
  if (typeof input === "string") return input;
  return input.map((r) => r.text).join("");
}

export const headingBlockSchema = z.object({
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]),
  text: z.string().min(1).max(500).transform(normalizeText),
  id: z.string().max(100).optional(),
});

export const paragraphBlockSchema = z.object({
  type: z.literal("paragraph"),
  // v2: array of inline runs; v1 fallback: plain text string
  runs: z.array(inlineRunSchema).optional(),
  text: z.string().max(5000).transform(normalizeText).optional(),
}).refine(
  (b) => (b.runs && b.runs.length > 0) || (typeof b.text === "string" && b.text.length > 0),
  { message: "Paragraph must have non-empty text or inline runs" }
);

export const listBlockSchema = z.object({
  type: z.literal("list"),
  ordered: z.boolean(),
  // Items in v2 can be InlineRun[] or string (v1)
  items: z
    .array(
      z.union([
        z.string().min(1).max(1000).transform(normalizeText),
        z.array(inlineRunSchema).min(1),
      ])
    )
    .min(1, "List must contain at least one item")
    .max(40, "List cannot exceed 40 items"),
});

export const quoteBlockSchema = z.object({
  type: z.literal("quote"),
  runs: z.array(inlineRunSchema).optional(),
  text: z.string().max(2000).transform(normalizeText).optional(),
  cite: z.string().max(200).transform(normalizeText).optional(),
}).refine(
  (b) => (b.runs && b.runs.length > 0) || (typeof b.text === "string" && b.text.length > 0),
  { message: "Quote must have non-empty text or inline runs" }
);

export const calloutBlockSchema = z.object({
  type: z.literal("callout"),
  tone: z.enum(["tip", "note", "warning"]),
  title: z.string().min(1).max(150).transform(normalizeText),
  runs: z.array(inlineRunSchema).optional(),
  text: z.string().max(2000).transform(normalizeText).optional(),
}).refine(
  (b) => (b.runs && b.runs.length > 0) || (typeof b.text === "string" && b.text.length > 0),
  { message: "Callout must have non-empty text or inline runs" }
);

export const imageBlockSchema = z
  .object({
    type: z.literal("image"),
    mediaId: z.string().uuid("mediaId must be a valid UUID").optional(),
    slot: z.string().min(1).max(50).optional(),
    url: z.never({ message: "Raw image URLs are forbidden; reference images by mediaId only." }).optional(),
    alt: z.string().max(200).transform(normalizeText).optional(),
    caption: z.string().max(300).transform(normalizeText).optional(),
    captionRuns: z.array(inlineRunSchema).optional(),
    layout: z.enum(["normal", "wide"]).default("normal"),
  })
  .refine(
    (data) => Boolean(data.mediaId || data.slot),
    { message: "Image block must specify either a valid mediaId or a legacy slot identifier." }
  );

export const CURRENT_CONTENT_SCHEMA_VERSION = 4;
export const ACCEPTED_CONTENT_SCHEMA_VERSIONS = [1, 2, 3, 4] as const;

export const youtubeBlockSchema = z.object({
  type: z.literal("youtube"),
  videoId: z.string().uuid("videoId must be a valid UUID"),
  url: z.never({ message: "Raw YouTube URLs are forbidden; reference videos by videoId only." }).optional(),
  src: z.never({ message: "Raw iframe HTML or src is forbidden." }).optional(),
  caption: z.string().max(300).transform(normalizeText).optional(),
  captionRuns: z.array(inlineRunSchema).optional(),
});

export const contentBlockSchema = z.discriminatedUnion("type", [
  headingBlockSchema,
  paragraphBlockSchema,
  listBlockSchema,
  quoteBlockSchema,
  calloutBlockSchema,
  imageBlockSchema,
  youtubeBlockSchema,
]);

export const MAX_CONTENT_JSON_BYTES = 200 * 1024; // 200 KB

export const blogContentArraySchema = z
  .array(contentBlockSchema)
  .min(1, "Post content must have at least one block")
  .max(300, "Post content cannot exceed 300 blocks")
  .refine(
    (blocks) => {
      const bytes = Buffer.byteLength(JSON.stringify(blocks), "utf-8");
      return bytes <= MAX_CONTENT_JSON_BYTES;
    },
    { message: "Total content JSON cannot exceed 200 KB" }
  );

export type HeadingBlock = z.infer<typeof headingBlockSchema>;
export type ParagraphBlock = z.infer<typeof paragraphBlockSchema>;
export type ListBlock = z.infer<typeof listBlockSchema>;
export type QuoteBlock = z.infer<typeof quoteBlockSchema>;
export type CalloutBlock = z.infer<typeof calloutBlockSchema>;
export type ImageBlock = z.infer<typeof imageBlockSchema>;
export type YoutubeBlock = z.infer<typeof youtubeBlockSchema>;
export type ContentBlock = z.infer<typeof contentBlockSchema>;

export function validateBlogContent(data: unknown): ContentBlock[] {
  return blogContentArraySchema.parse(data);
}

/**
 * Calculates estimated reading time based on total word count across all textual blocks.
 * Supports both v1 plain text strings and v2 inline runs.
 */
export function calculateReadingTimeMinutes(blocks: ContentBlock[]): number {
  let wordCount = 0;
  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        wordCount += block.text.trim().split(/\s+/).filter(Boolean).length;
        break;
      case "paragraph": {
        const text = block.runs ? extractTextFromRuns(block.runs) : block.text || "";
        wordCount += text.trim().split(/\s+/).filter(Boolean).length;
        break;
      }
      case "list":
        for (const item of block.items) {
          const itemText = typeof item === "string" ? item : extractTextFromRuns(item);
          wordCount += itemText.trim().split(/\s+/).filter(Boolean).length;
        }
        break;
      case "quote": {
        const text = block.runs ? extractTextFromRuns(block.runs) : block.text || "";
        wordCount += text.trim().split(/\s+/).filter(Boolean).length;
        if (block.cite) {
          wordCount += block.cite.trim().split(/\s+/).filter(Boolean).length;
        }
        break;
      }
      case "callout": {
        const text = block.runs ? extractTextFromRuns(block.runs) : block.text || "";
        wordCount += (block.title + " " + text).trim().split(/\s+/).filter(Boolean).length;
        break;
      }
      default:
        break;
    }
  }
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Extracts Table of Contents headings from blocks.
 */
export function extractHeadingsForTOC(blocks: ContentBlock[]): { id: string; text: string; level: 2 | 3 }[] {
  const headings: { id: string; text: string; level: 2 | 3 }[] = [];
  for (const b of blocks) {
    if (b.type === "heading") {
      const headingId =
        b.id ||
        b.text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      headings.push({ id: headingId, text: b.text, level: b.level });
    }
  }
  return headings;
}

import { z } from "zod";

const httpsUrlSchema = z
  .string()
  .url()
  .refine((url) => url.startsWith("https://"), {
    message: "URLs must use secure HTTPS protocol",
  });

export const headingBlockSchema = z.object({
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]),
  text: z.string().min(1).max(200),
  id: z.string().max(100).optional(),
});

export const paragraphBlockSchema = z.object({
  type: z.literal("paragraph"),
  text: z.string().min(1).max(5000),
});

export const listBlockSchema = z.object({
  type: z.literal("list"),
  ordered: z.boolean(),
  items: z.array(z.string().min(1).max(1000)).min(1).max(50),
});

export const quoteBlockSchema = z.object({
  type: z.literal("quote"),
  text: z.string().min(1).max(2000),
  cite: z.string().max(200).optional(),
});

export const calloutBlockSchema = z.object({
  type: z.literal("callout"),
  tone: z.enum(["tip", "note", "warning"]),
  title: z.string().min(1).max(150),
  text: z.string().min(1).max(2000),
});

export const imageBlockSchema = z.object({
  type: z.literal("image"),
  slot: z.string().max(50).optional(),
  url: httpsUrlSchema.optional(),
  alt: z.string().max(200).optional(),
  caption: z.string().max(300).optional(),
}).refine(
  (data) => !!data.slot || !!data.url,
  { message: "Image block must specify either a slot identifier or an HTTPS url" }
);

export const youtubeBlockSchema = z.object({
  type: z.literal("youtube"),
  videoId: z.string().min(1).max(50),
  caption: z.string().max(300).optional(),
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

export const blogContentArraySchema = z
  .array(contentBlockSchema)
  .min(1, "Post content must have at least one block")
  .max(300, "Post content cannot exceed 300 blocks");

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
 * Standard adult reading speed is approximately 200 words per minute.
 */
export function calculateReadingTimeMinutes(blocks: ContentBlock[]): number {
  let wordCount = 0;
  for (const block of blocks) {
    switch (block.type) {
      case "heading":
      case "paragraph":
        wordCount += block.text.trim().split(/\s+/).filter(Boolean).length;
        break;
      case "list":
        for (const item of block.items) {
          wordCount += item.trim().split(/\s+/).filter(Boolean).length;
        }
        break;
      case "quote":
        wordCount += block.text.trim().split(/\s+/).filter(Boolean).length;
        if (block.cite) {
          wordCount += block.cite.trim().split(/\s+/).filter(Boolean).length;
        }
        break;
      case "callout":
        wordCount += (block.title + " " + block.text).trim().split(/\s+/).filter(Boolean).length;
        break;
      default:
        break;
    }
  }
  return Math.max(1, Math.ceil(wordCount / 200));
}

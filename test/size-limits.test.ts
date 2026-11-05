import { describe, it, expect } from "vitest";
import {
  blogContentArraySchema,
  MAX_CONTENT_JSON_BYTES,
} from "../src/lib/blog-content";
import { postEditorDataSchema } from "../src/server/owner/posts/validation";

describe("Size Limits and Schema Boundaries", () => {
  it("rejects title longer than 160 characters", () => {
    const invalidData = {
      title: "A".repeat(161),
      categorySlug: "oral-hygiene",
      content: [{ type: "paragraph", runs: [{ text: "Valid content" }] }],
    };
    const res = postEditorDataSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it("rejects excerpt longer than 320 characters", () => {
    const invalidData = {
      title: "Valid Title",
      categorySlug: "oral-hygiene",
      excerpt: "E".repeat(321),
      content: [{ type: "paragraph", runs: [{ text: "Valid content" }] }],
    };
    const res = postEditorDataSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it("rejects more than 8 tags or tag longer than 30 characters", () => {
    const nineTags = {
      title: "Valid Title",
      categorySlug: "oral-hygiene",
      tags: ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"],
      content: [{ type: "paragraph", runs: [{ text: "Valid content" }] }],
    };
    expect(postEditorDataSchema.safeParse(nineTags).success).toBe(false);

    const longTag = {
      title: "Valid Title",
      categorySlug: "oral-hygiene",
      tags: ["T".repeat(31)],
      content: [{ type: "paragraph", runs: [{ text: "Valid content" }] }],
    };
    expect(postEditorDataSchema.safeParse(longTag).success).toBe(false);
  });

  it("rejects list with more than 40 items", () => {
    const listWith41Items = {
      type: "list" as const,
      ordered: false,
      items: Array.from({ length: 41 }, (_, i) => [{ text: `Item ${i}` }]),
    };
    const res = blogContentArraySchema.safeParse([listWith41Items]);
    expect(res.success).toBe(false);
  });

  it("rejects more than 300 content blocks", () => {
    const blocks301 = Array.from({ length: 301 }, (_, i) => ({
      type: "paragraph" as const,
      runs: [{ text: `Paragraph block ${i}` }],
    }));
    const res = blogContentArraySchema.safeParse(blocks301);
    expect(res.success).toBe(false);
  });

  it("rejects content exceeding 200 KB in JSON bytes", () => {
    const largeText = "x".repeat(MAX_CONTENT_JSON_BYTES + 100);
    const oversizedBlocks = [
      {
        type: "paragraph" as const,
        runs: [{ text: largeText }],
      },
    ];
    const res = blogContentArraySchema.safeParse(oversizedBlocks);
    expect(res.success).toBe(false);
  });
});

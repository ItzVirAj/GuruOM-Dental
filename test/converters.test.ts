import { describe, it, expect } from "vitest";
import {
  blocksToEditorDoc,
  editorDocToBlocks,
  TipTapDoc,
} from "../src/lib/editor/converters";
import { blogPosts } from "../scripts/db/seed-data/blog";
import { ContentBlock, InlineRun } from "../src/lib/blog-content";

// Helper to convert v1 blocks to v2 runs as done by the migration
function convertV1ToV2(blocks: unknown[]): ContentBlock[] {
  return blocks.map((raw) => {
    const rawBlock = raw as Record<string, unknown>;
    switch (rawBlock.type) {
      case "paragraph":
        return {
          type: "paragraph" as const,
          runs: (rawBlock.runs as InlineRun[]) || [{ text: String(rawBlock.text || "") }],
        };
      case "list":
        return {
          type: "list" as const,
          ordered: Boolean(rawBlock.ordered),
          items: ((rawBlock.items as unknown[]) || []).map((it) =>
            typeof it === "string" ? [{ text: it }] : (it as InlineRun[])
          ),
        };
      case "quote":
        return {
          type: "quote" as const,
          runs: (rawBlock.runs as InlineRun[]) || [{ text: String(rawBlock.text || "") }],
          ...(rawBlock.cite ? { cite: String(rawBlock.cite) } : {}),
        };
      case "callout":
        return {
          type: "callout" as const,
          tone: (rawBlock.tone as "tip" | "note" | "warning") || "note",
          title: String(rawBlock.title || "Note"),
          runs: (rawBlock.runs as InlineRun[]) || [{ text: String(rawBlock.text || "") }],
        };
      case "image":
        return {
          type: "image" as const,
          layout: "normal" as const,
          ...(rawBlock.slot ? { slot: String(rawBlock.slot) } : {}),
          ...(rawBlock.alt ? { alt: String(rawBlock.alt) } : {}),
          ...(rawBlock.caption ? { caption: String(rawBlock.caption) } : {}),
          captionRuns: rawBlock.caption ? [{ text: String(rawBlock.caption) }] : undefined,
        };
      case "heading":
        return {
          type: "heading" as const,
          level: rawBlock.level === 3 ? 3 : 2,
          text: String(rawBlock.text || ""),
          ...(rawBlock.id ? { id: String(rawBlock.id) } : {}),
        };
      case "youtube":
        return {
          type: "youtube" as const,
          videoId: String(rawBlock.videoId || ""),
          ...(rawBlock.caption ? { caption: String(rawBlock.caption) } : {}),
        };
      default:
        return rawBlock as unknown as ContentBlock;
    }
  });
}

describe("Editor Document Converters", () => {
  it("preserves seeded posts across round-trip: blocks -> editorDoc -> blocks", () => {
    expect(blogPosts.length).toBeGreaterThan(0);

    for (const post of blogPosts) {
      const v2Original = convertV1ToV2(post.content);
      const editorDoc = blocksToEditorDoc(v2Original);
      const roundTripBlocks = editorDocToBlocks(editorDoc);

      // Verify that the round-trip retains all blocks and content faithfully
      expect(roundTripBlocks.length).toBe(v2Original.length);
      for (let i = 0; i < v2Original.length; i++) {
        const orig = v2Original[i];
        const res = roundTripBlocks[i];
        expect(res.type).toBe(orig.type);

        if (orig.type === "heading" && res.type === "heading") {
          expect(res.level).toBe(orig.level);
          expect(res.text).toBe(orig.text);
        } else if (orig.type === "paragraph" && res.type === "paragraph") {
          expect(res.runs).toEqual(orig.runs);
        } else if (orig.type === "list" && res.type === "list") {
          expect(res.ordered).toBe(orig.ordered);
          expect(res.items).toEqual(orig.items);
        } else if (orig.type === "quote" && res.type === "quote") {
          expect(res.runs).toEqual(orig.runs);
          expect(res.cite).toBe(orig.cite);
        } else if (orig.type === "callout" && res.type === "callout") {
          expect(res.tone).toBe(orig.tone);
          expect(res.title).toBe(orig.title);
          expect(res.runs).toEqual(orig.runs);
        } else if (orig.type === "image" && res.type === "image") {
          expect(res.slot).toBe(orig.slot);
          expect(res.caption).toBe(orig.caption);
        }
      }
    }
  });

  it("strictly drops unknown or disallowed nodes from document", () => {
    const maliciousDoc: TipTapDoc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Safe paragraph" }],
        },
        {
          type: "table",
          content: [],
        },
        {
          type: "codeBlock",
          content: [{ type: "text", text: "console.log('secret')" }],
        },
        {
          type: "rawHtml",
          attrs: { html: "<script>alert(1)</script>" },
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Safe Heading" }],
        },
      ],
    };

    const sanitizedBlocks = editorDocToBlocks(maliciousDoc);
    expect(sanitizedBlocks.length).toBe(2);
    expect(sanitizedBlocks[0].type).toBe("paragraph");
    expect(sanitizedBlocks[1].type).toBe("heading");
  });

  it("filters out unsafe links during conversion", () => {
    const docWithUnsafeLink: TipTapDoc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Click me",
              marks: [
                {
                  type: "link",
                  attrs: { href: "javascript:alert(1)" },
                },
              ],
            },
          ],
        },
      ],
    };

    const blocks = editorDocToBlocks(docWithUnsafeLink);
    expect(blocks.length).toBe(1);
    if (blocks[0].type === "paragraph" && blocks[0].runs) {
      expect(blocks[0].runs[0].href).toBeUndefined();
      expect(blocks[0].runs[0].text).toBe("Click me");
    }
  });
});

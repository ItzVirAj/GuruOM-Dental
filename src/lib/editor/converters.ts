import {
  ContentBlock,
  InlineRun,
  InlineMark,
  normalizeText,
  isSafeLink,
} from "../blog-content";

export interface TipTapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
}

export interface TipTapDoc {
  type: "doc";
  content: TipTapNode[];
}

/**
 * Converts InlineRun[] to TipTap text nodes with marks.
 */
export function runsToTipTapContent(runs?: InlineRun[]): TipTapNode[] {
  if (!runs || runs.length === 0) return [];

  const nodes: TipTapNode[] = [];
  for (const run of runs) {
    if (!run.text) continue;

    const marks: TipTapMark[] = [];
    if (run.marks?.includes("bold")) {
      marks.push({ type: "bold" });
    }
    if (run.marks?.includes("italic")) {
      marks.push({ type: "italic" });
    }
    if (run.href && isSafeLink(run.href)) {
      marks.push({ type: "link", attrs: { href: run.href } });
    }

    nodes.push({
      type: "text",
      text: run.text,
      ...(marks.length > 0 ? { marks } : {}),
    });
  }

  return nodes;
}

/**
 * Converts TipTap text nodes with marks back into InlineRun[].
 * Enforces safe link validation and text normalization.
 */
export function tipTapContentToRuns(nodes?: TipTapNode[]): InlineRun[] {
  if (!nodes || nodes.length === 0) return [];

  const runs: InlineRun[] = [];
  for (const node of nodes) {
    if (node.type !== "text" || !node.text) continue;

    const cleanText = normalizeText(node.text);
    if (!cleanText) continue;

    const marks: InlineMark[] = [];
    let safeHref: string | undefined;

    if (node.marks) {
      for (const m of node.marks) {
        if (m.type === "bold" && !marks.includes("bold")) {
          marks.push("bold");
        }
        if (m.type === "italic" && !marks.includes("italic")) {
          marks.push("italic");
        }
        if (m.type === "link" && typeof m.attrs?.href === "string") {
          const rawHref = m.attrs.href.trim();
          if (isSafeLink(rawHref)) {
            safeHref = rawHref;
          }
        }
      }
    }

    const run: InlineRun = {
      text: cleanText,
      ...(marks.length > 0 ? { marks } : {}),
      ...(safeHref ? { href: safeHref } : {}),
    };

    runs.push(run);
  }

  return runs;
}

/**
 * Extracts plain text from TipTap nodes (for headings).
 */
function extractPlainTextFromNodes(nodes?: TipTapNode[]): string {
  if (!nodes) return "";
  return nodes
    .filter((n) => n.type === "text" && n.text)
    .map((n) => n.text)
    .join("");
}

/**
 * Converts ContentBlock[] to a TipTap document.
 */
export function blocksToEditorDoc(blocks: ContentBlock[]): TipTapDoc {
  const content: TipTapNode[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "heading": {
        content.push({
          type: "heading",
          attrs: { level: block.level, id: block.id },
          content: block.text ? [{ type: "text", text: block.text }] : [],
        });
        break;
      }
      case "paragraph": {
        const runs = block.runs || (block.text ? [{ text: block.text }] : []);
        content.push({
          type: "paragraph",
          content: runsToTipTapContent(runs),
        });
        break;
      }
      case "list": {
        const listType = block.ordered ? "orderedList" : "bulletList";
        const items: TipTapNode[] = block.items.map((item) => {
          const itemRuns = typeof item === "string" ? [{ text: item }] : item;
          return {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: runsToTipTapContent(itemRuns),
              },
            ],
          };
        });

        content.push({
          type: listType,
          content: items,
        });
        break;
      }
      case "quote": {
        const runs = block.runs || (block.text ? [{ text: block.text }] : []);
        content.push({
          type: "blockquote",
          attrs: block.cite ? { cite: block.cite } : {},
          content: [
            {
              type: "paragraph",
              content: runsToTipTapContent(runs),
            },
          ],
        });
        break;
      }
      case "callout": {
        const runs = block.runs || (block.text ? [{ text: block.text }] : []);
        content.push({
          type: "callout",
          attrs: {
            tone: block.tone,
            title: block.title,
          },
          content: [
            {
              type: "paragraph",
              content: runsToTipTapContent(runs),
            },
          ],
        });
        break;
      }
      case "image": {
        if ("mediaId" in block && block.mediaId) {
          content.push({
            type: "image",
            attrs: {
              mediaId: block.mediaId,
              alt: block.alt,
              caption: typeof block.caption === "string" ? block.caption : undefined,
              layout: block.layout || "normal",
            },
          });
        } else {
          content.push({
            type: "legacyImage",
            attrs: {
              slot: block.slot,
              alt: block.alt,
              caption: typeof block.caption === "string" ? block.caption : undefined,
            },
          });
        }
        break;
      }
      case "youtube": {
        content.push({
          type: "youtube",
          attrs: {
            videoId: block.videoId,
            caption: block.caption,
            captionRuns: block.captionRuns,
          },
        });
        break;
      }
      default:
        // Ignore unknown blocks
        break;
    }
  }

  return {
    type: "doc",
    content,
  };
}

/**
 * Converts a TipTap document back into ContentBlock[].
 * Strictly drops unknown nodes and sanitizes all links/text.
 */
export function editorDocToBlocks(doc: TipTapDoc | unknown): ContentBlock[] {
  if (!doc || typeof doc !== "object" || !("content" in doc) || !Array.isArray(doc.content)) {
    return [];
  }

  const blocks: ContentBlock[] = [];

  for (const node of doc.content as TipTapNode[]) {
    switch (node.type) {
      case "heading": {
        const text = normalizeText(extractPlainTextFromNodes(node.content));
        if (!text) continue;
        const rawLevel = Number(node.attrs?.level);
        const level: 2 | 3 = rawLevel === 3 ? 3 : 2;
        const id = typeof node.attrs?.id === "string" ? node.attrs.id : undefined;
        blocks.push({
          type: "heading",
          level,
          text: text.slice(0, 500),
          ...(id ? { id } : {}),
        });
        break;
      }
      case "paragraph": {
        const runs = tipTapContentToRuns(node.content);
        if (runs.length === 0) continue;
        blocks.push({
          type: "paragraph",
          runs,
        });
        break;
      }
      case "bulletList":
      case "orderedList": {
        const ordered = node.type === "orderedList";
        const items: InlineRun[][] = [];

        if (Array.isArray(node.content)) {
          for (const itemNode of node.content) {
            if (itemNode.type !== "listItem" || !Array.isArray(itemNode.content)) continue;
            // Gather all runs from child paragraphs
            const itemRuns: InlineRun[] = [];
            for (const child of itemNode.content) {
              if (child.content) {
                itemRuns.push(...tipTapContentToRuns(child.content));
              }
            }
            if (itemRuns.length > 0) {
              items.push(itemRuns);
            }
          }
        }

        if (items.length > 0) {
          blocks.push({
            type: "list",
            ordered,
            items,
          });
        }
        break;
      }
      case "blockquote": {
        const runs: InlineRun[] = [];
        if (Array.isArray(node.content)) {
          for (const p of node.content) {
            if (p.content) {
              runs.push(...tipTapContentToRuns(p.content));
            }
          }
        }
        if (runs.length === 0) continue;
        const rawCite = typeof node.attrs?.cite === "string" ? normalizeText(node.attrs.cite) : undefined;
        blocks.push({
          type: "quote",
          runs,
          ...(rawCite ? { cite: rawCite } : {}),
        });
        break;
      }
      case "callout": {
        const toneRaw = node.attrs?.tone;
        const tone = toneRaw === "tip" || toneRaw === "warning" ? toneRaw : "note";
        const title = typeof node.attrs?.title === "string" ? normalizeText(node.attrs.title) : "Note";

        const runs: InlineRun[] = [];
        if (Array.isArray(node.content)) {
          for (const p of node.content) {
            if (p.content) {
              runs.push(...tipTapContentToRuns(p.content));
            }
          }
        }
        if (runs.length === 0) continue;

        blocks.push({
          type: "callout",
          tone,
          title: title || "Note",
          runs,
        });
        break;
      }
      case "image": {
        const mediaId = typeof node.attrs?.mediaId === "string" ? node.attrs.mediaId : undefined;
        if (!mediaId) continue;

        const alt = typeof node.attrs?.alt === "string" ? normalizeText(node.attrs.alt).slice(0, 200) : undefined;
        const caption = typeof node.attrs?.caption === "string" ? normalizeText(node.attrs.caption) : undefined;
        const layout = node.attrs?.layout === "wide" ? "wide" : "normal";

        blocks.push({
          type: "image",
          mediaId,
          layout,
          ...(alt ? { alt } : {}),
          ...(caption ? { caption } : {}),
          ...(caption ? { captionRuns: [{ text: caption }] } : {}),
        });
        break;
      }
      case "legacyImage": {
        const slot = typeof node.attrs?.slot === "string" ? node.attrs.slot : undefined;
        if (!slot) continue;

        const alt = typeof node.attrs?.alt === "string" ? normalizeText(node.attrs.alt).slice(0, 200) : undefined;
        const caption = typeof node.attrs?.caption === "string" ? normalizeText(node.attrs.caption) : undefined;

        blocks.push({
          type: "image",
          slot,
          layout: "normal",
          ...(alt ? { alt } : {}),
          ...(caption ? { caption } : {}),
          ...(caption ? { captionRuns: [{ text: caption }] } : {}),
        });
        break;
      }
      case "youtube": {
        const videoId = typeof node.attrs?.videoId === "string" ? normalizeText(node.attrs.videoId) : "";
        if (!videoId) continue;

        const caption = typeof node.attrs?.caption === "string" ? normalizeText(node.attrs.caption) : undefined;
        const captionRuns = Array.isArray(node.attrs?.captionRuns)
          ? (node.attrs.captionRuns as InlineRun[])
          : caption
          ? [{ text: caption }]
          : undefined;

        blocks.push({
          type: "youtube",
          videoId,
          ...(caption ? { caption } : {}),
          ...(captionRuns ? { captionRuns } : {}),
        });
        break;
      }
      default:
        // Ignore unallowed nodes
        break;
    }
  }

  return blocks.length > 0
    ? blocks
    : [{ type: "paragraph", runs: [{ text: " " }] }];
}

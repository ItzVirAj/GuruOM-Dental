import type { Editor } from "@tiptap/react";
import type { SelectedVideoPayload } from "@/components/editor/video-picker-modal";
import type { PastedYouTubeContext } from "@/components/editor/youtube-paste-modal";

/**
 * Client-safe YouTube video link detector used to intercept pasted YouTube URLs
 * in the TipTap editor and detect existing inline YouTube URLs for conversion.
 * Authoritative validation & oEmbed verification still runs server-side.
 */

const ALLOWED_YOUTUBE_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtube-nocookie.com",
]);

const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

const INLINE_YOUTUBE_URL_REGEX =
  /https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?[^\s<"']+|shorts\/[A-Za-z0-9_-]{11}[^\s<"']*|live\/[A-Za-z0-9_-]{11}[^\s<"']*|embed\/[A-Za-z0-9_-]{11}[^\s<"']*)|youtu\.be\/[A-Za-z0-9_-]{11}[^\s<"']*|www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}[^\s<"']*)/i;

export interface DetectedYouTubePaste {
  url: string;
  youtubeId: string;
}

export interface InlineYouTubeMatch {
  url: string;
  youtubeId: string;
  sectionTitle: string;
  afterLineSnippet: string;
  removeFrom: number;
  removeTo: number;
  insertPos: number;
  blockBefore: number;
}

/**
 * Returns { url, youtubeId } only when the pasted text is a single standalone YouTube video link.
 * Multi-word sentences, playlists, channels, and non-YouTube URLs return null so normal paste applies.
 */
export function detectStandaloneYouTubeUrl(
  rawText: string
): DetectedYouTubePaste | null {
  if (!rawText) return null;
  const trimmed = rawText.trim();
  if (!trimmed || /\s/.test(trimmed) || trimmed.length > 500) {
    return null;
  }

  let candidate = trimmed;
  const lower = candidate.toLowerCase();
  if (!lower.startsWith("https://") && !lower.startsWith("http://")) {
    if (
      lower.startsWith("youtu.be/") ||
      lower.startsWith("youtube.com/") ||
      lower.startsWith("www.youtube.com/") ||
      lower.startsWith("m.youtube.com/") ||
      lower.startsWith("www.youtube-nocookie.com/")
    ) {
      candidate = `https://${candidate}`;
    } else {
      return null;
    }
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;
  if (parsed.username || parsed.password) return null;
  if (parsed.port && parsed.port !== "443") return null;

  const hostname = parsed.hostname.toLowerCase();
  if (!ALLOWED_YOUTUBE_HOSTS.has(hostname)) return null;

  const pathname = parsed.pathname;
  let videoId: string | null = null;

  if (hostname === "youtu.be") {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 1) {
      videoId = segments[0];
    }
  } else if (pathname === "/watch") {
    videoId = parsed.searchParams.get("v");
  } else if (
    pathname.startsWith("/shorts/") ||
    pathname.startsWith("/embed/") ||
    pathname.startsWith("/live/")
  ) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      videoId = segments[1];
    }
  }

  if (!videoId || !YOUTUBE_ID_REGEX.test(videoId)) {
    return null;
  }

  return {
    url: candidate,
    youtubeId: videoId,
  };
}

/**
 * Extracts a standalone YouTube URL from browser clipboard data (`text/plain`, `text/uri-list`, or HTML anchor).
 */
export function extractYouTubePasteFromClipboard(
  clipboardData: DataTransfer | null | undefined
): DetectedYouTubePaste | null {
  if (!clipboardData) return null;

  const plain = clipboardData.getData("text/plain");
  const fromPlain = detectStandaloneYouTubeUrl(plain);
  if (fromPlain) return fromPlain;

  const uriList = clipboardData.getData("text/uri-list");
  if (uriList) {
    const firstLine = uriList
      .split(/\r?\n/)
      .find((line) => line.trim() && !line.startsWith("#"));
    if (firstLine) {
      const fromUri = detectStandaloneYouTubeUrl(firstLine);
      if (fromUri) return fromUri;
    }
  }

  const html = clipboardData.getData("text/html");
  if (html && !plain.trim()) {
    const hrefMatch = html.match(/href\s*=\s*["']([^"']+)["']/i);
    if (hrefMatch?.[1]) {
      return detectStandaloneYouTubeUrl(hrefMatch[1]);
    }
  }

  return null;
}

/**
 * Finds the first YouTube video URL inside an inline string (used to scan existing draft text).
 */
export function findYouTubeUrlInText(
  text: string
): (DetectedYouTubePaste & { index: number; length: number }) | null {
  if (!text) return null;
  const match = text.match(INLINE_YOUTUBE_URL_REGEX);
  if (!match || match.index === undefined) return null;

  const rawMatched = match[0].replace(/[.,;!?)]+$/, "");
  const verified = detectStandaloneYouTubeUrl(rawMatched);
  if (!verified) return null;

  return {
    ...verified,
    index: match.index,
    length: rawMatched.length,
  };
}

/**
 * Scans a TipTap editor document for inline YouTube links inside paragraphs/textblocks.
 */
export function findInlineYouTubeLinksInEditor(
  editor: Editor | null
): InlineYouTubeMatch[] {
  if (!editor) return [];
  const matches: InlineYouTubeMatch[] = [];
  const { doc } = editor.state;
  let currentSection = "Article Introduction";

  doc.forEach((topNode, topOffset) => {
    if (topNode.type.name === "heading" && topNode.textContent.trim()) {
      currentSection = topNode.textContent.trim();
      return;
    }

    if (!topNode.isTextblock) return;

    const blockStart = topOffset + 1;
    const blockAfter = topOffset + topNode.nodeSize;
    const blockText = topNode.textContent.trim();

    let foundInBlock = false;
    topNode.forEach((child, childOffset) => {
      if (foundInBlock || !child.isText) return;
      const posFrom = blockStart + childOffset;
      const posTo = posFrom + child.nodeSize;

      const linkMark = child.marks.find(
        (m) => m.type.name === "link" && typeof m.attrs?.href === "string"
      );
      if (linkMark && typeof linkMark.attrs?.href === "string") {
        const detected = detectStandaloneYouTubeUrl(linkMark.attrs.href);
        if (detected) {
          const snippet = blockText.replace(child.text || "", "").trim();
          matches.push({
            url: detected.url,
            youtubeId: detected.youtubeId,
            sectionTitle: currentSection,
            afterLineSnippet: snippet.slice(0, 72),
            removeFrom: posFrom,
            removeTo: posTo,
            insertPos: blockAfter,
            blockBefore: topOffset,
          });
          foundInBlock = true;
          return;
        }
      }

      if (child.text) {
        const inlineMatch = findYouTubeUrlInText(child.text);
        if (inlineMatch) {
          const matchFrom = posFrom + inlineMatch.index;
          const matchTo = matchFrom + inlineMatch.length;
          const snippet = blockText.replace(inlineMatch.url, "").trim();
          matches.push({
            url: inlineMatch.url,
            youtubeId: inlineMatch.youtubeId,
            sectionTitle: currentSection,
            afterLineSnippet: snippet.slice(0, 72),
            removeFrom: matchFrom,
            removeTo: matchTo,
            insertPos: blockAfter,
            blockBefore: topOffset,
          });
          foundInBlock = true;
        }
      }
    });
  });

  return matches;
}

/**
 * Inserts a verified YouTube node at the exact target section range, removing any converted raw link.
 */
export function insertVideoAtSectionInEditor(
  editor: Editor | null,
  videoPayload: SelectedVideoPayload & { caption?: string },
  ctx: PastedYouTubeContext
): void {
  if (!editor) return;

  editor
    .chain()
    .focus()
    .command(({ tr, state, dispatch }) => {
      const youtubeType = state.schema.nodes.youtube;
      if (!youtubeType) return false;

      const videoNode = youtubeType.create({
        videoId: videoPayload.videoId,
        title: videoPayload.title,
        thumbnailUrl: videoPayload.thumbnailUrl,
        youtubeId: videoPayload.youtubeId,
        status: videoPayload.status,
        visible: videoPayload.visible,
        ...(videoPayload.caption ? { caption: videoPayload.caption } : {}),
      });

      let from = ctx.insertFrom;
      let to = ctx.insertTo;

      if (
        typeof ctx.removeFrom === "number" &&
        typeof ctx.removeTo === "number" &&
        ctx.removeTo > ctx.removeFrom
      ) {
        tr.delete(ctx.removeFrom, ctx.removeTo);
        from = tr.mapping.map(ctx.insertFrom);
        to = tr.mapping.map(ctx.insertTo);

        if (typeof ctx.blockBefore === "number") {
          const mappedBefore = tr.mapping.map(ctx.blockBefore);
          const nodeAfter = tr.doc.nodeAt(mappedBefore);
          if (nodeAfter && nodeAfter.isTextblock && !nodeAfter.textContent.trim()) {
            from = mappedBefore;
            to = mappedBefore + nodeAfter.nodeSize;
          }
        }
      }

      tr.replaceWith(from, to, videoNode);
      if (dispatch) dispatch(tr);
      return true;
    })
    .run();
}

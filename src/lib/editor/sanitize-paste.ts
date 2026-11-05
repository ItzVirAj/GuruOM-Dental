import { isSafeLink, normalizeText } from "../blog-content";

/**
 * Sanitizes pasted HTML string for TipTap editor.
 * Strips all scripts, styles, classes, images, unknown elements, and unallowed attributes.
 * Only allows clean p, h2, h3, ul, ol, li, blockquote, strong, b, em, i, and safe <a> tags.
 */
export function sanitizePastedHtml(html: string): string {
  if (!html) return "";

  // 1. Remove dangerous script, style, iframe, object, embed, svg tags and their contents completely
  let clean = html.replace(/<(script|style|iframe|object|embed|svg)[\s\S]*?<\/\1>/gi, "");

  // 2. Remove all self-closing dangerous tags (like <img ... />, <input ... />, <link ... />)
  clean = clean.replace(/<(img|input|button|textarea|select|link|meta|base)[\s\S]*?\/?>/gi, "");

  // 3. Remove all on* event handlers (e.g. onerror, onclick)
  clean = clean.replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "");
  clean = clean.replace(/\son\w+\s*=\s*[^>\s]+/gi, "");

  // 4. Remove all style, class, id, data-* attributes from all tags
  clean = clean.replace(/\s(style|class|id|data-[\w-]+)\s*=\s*(['"]).*?\2/gi, "");
  clean = clean.replace(/\s(style|class|id|data-[\w-]+)\s*=\s*[^>\s]+/gi, "");

  // 5. Clean up <a> tags: only retain href if it's safe (https, mailto, tel, relative), otherwise strip the <a> wrapper
  clean = clean.replace(/<a\b([^>]*)>(.*?)<\/a>/gi, (_match, attrs, content) => {
    const hrefMatch = attrs.match(/\bhref\s*=\s*(['"])(.*?)\1/i) || attrs.match(/\bhref\s*=\s*([^>\s]+)/i);
    const href = hrefMatch ? (hrefMatch[2] || hrefMatch[1]) : "";
    if (href && isSafeLink(href)) {
      return `<a href="${href}">${content}</a>`;
    }
    // If unsafe or missing href, unwrap the anchor and keep inner content
    return content;
  });

  // 6. Map disallowed headings (h1, h4, h5, h6) to allowed h2 or p
  clean = clean.replace(/<h1\b[^>]*>/gi, "<h2>");
  clean = clean.replace(/<\/h1>/gi, "</h2>");
  clean = clean.replace(/<h[456]\b[^>]*>/gi, "<p>");
  clean = clean.replace(/<\/h[456]>/gi, "</p>");

  // 7. Strip any remaining disallowed tags while preserving their contents
  // Allowed tags: p, h2, h3, ul, ol, li, blockquote, strong, b, em, i, a, br
  const allowedTags = ["p", "h2", "h3", "ul", "ol", "li", "blockquote", "strong", "b", "em", "i", "a", "br"];
  const tagRegex = /<\/?([a-z0-9]+)\b[^>]*>/gi;

  clean = clean.replace(tagRegex, (originalTag, tagName: string) => {
    const lower = tagName.toLowerCase();
    if (allowedTags.includes(lower)) {
      return originalTag;
    }
    return "";
  });

  return normalizeText(clean);
}

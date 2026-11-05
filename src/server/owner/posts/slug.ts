export const RESERVED_SLUGS: readonly string[] = [
  "new",
  "edit",
  "category",
  "tag",
  "page",
  "feed",
  "rss",
  "search",
  "admin",
  "api",
  "ow",
  "login",
  "verify",
  "settings",
  "dashboard",
  "sitemap",
  "robots",
];

/**
 * Transliterates, lowercases, and generates a URL-safe slug from a post title.
 */
export function generateSlug(title: string): string {
  if (!title) return "";

  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Non-alphanumeric to hyphens
    .replace(/^-+|-+$/g, "") // Trim hyphens
    .slice(0, 100);

  return slug || "untitled";
}

/**
 * Checks if a given slug is in the reserved system keywords list.
 */
export function isSlugReserved(slug: string): boolean {
  if (!slug) return true;
  const clean = slug.toLowerCase().trim();
  return RESERVED_SLUGS.includes(clean);
}

/**
 * Validates slug format: 3-120 lowercase alphanumeric characters and single hyphens.
 */
export function isValidSlugFormat(slug: string): boolean {
  if (!slug || slug.length < 3 || slug.length > 120) return false;
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && !isSlugReserved(slug);
}

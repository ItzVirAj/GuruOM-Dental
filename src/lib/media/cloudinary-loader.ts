/**
 * Cloudinary Custom Image Loader & URL Transformation Builders
 * Strictly generates pre-approved transformations to support Cloudinary "Strict Transformations".
 */

export const ALLOWED_IMAGE_WIDTHS = [320, 640, 960, 1280, 1920, 2400] as const;
export type AllowedImageWidth = (typeof ALLOWED_IMAGE_WIDTHS)[number];

export const ALLOWED_CLOUDINARY_TRANSFORMATIONS = [
  "f_auto,q_auto,c_limit,w_320",
  "f_auto,q_auto,c_limit,w_640",
  "f_auto,q_auto,c_limit,w_960",
  "f_auto,q_auto,c_limit,w_1280",
  "f_auto,q_auto,c_limit,w_1920",
  "f_auto,q_auto,c_limit,w_2400",
  "c_fill,g_auto,w_1200,h_750",
  "c_fill,g_auto,w_1200,h_630",
  "c_fill,g_auto,w_300,h_300",
] as const;

/**
 * Snaps any requested width to the nearest allowed fixed width (ceiling, capped at 2400).
 */
export function getNearestAllowedWidth(width: number): AllowedImageWidth {
  for (const allowed of ALLOWED_IMAGE_WIDTHS) {
    if (width <= allowed) {
      return allowed;
    }
  }
  return 2400;
}

export function getCloudName(): string {
  const name =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    "";
  return name.trim();
}

/**
 * Strips leading/trailing slashes and extracts raw publicId from a string or path.
 */
export function cleanPublicId(raw: string): string {
  if (!raw) return "";
  let clean = raw.trim();
  // If a full Cloudinary URL was passed, extract the public_id preserving folder paths
  const uploadMarker = /res\.cloudinary\.com\/[^/]+\/image\/upload\/(.+)$/i;
  const uploadMatch = clean.match(uploadMarker);
  if (uploadMatch?.[1]) {
    let tail = uploadMatch[1];
    // Strip optional transformations + version segment (e.g. "f_auto,q_auto/v1795593046/" or "v1795593046/")
    const versionMatch = tail.match(/^(?:[^/]+\/)*?v\d+\/(.+)$/);
    if (versionMatch?.[1]) {
      tail = versionMatch[1];
    } else {
      // No version segment: strip leading transformation segments (comma-separated or key_value params)
      tail = tail.replace(/^(?:[a-z]{1,4}_[^/]+\/)+/i, "");
    }
    clean = tail.replace(/\.[a-zA-Z0-9]+$/, "");
  }
  // Strip leading slash
  clean = clean.replace(/^\/+/, "");
  // Strip .webp extension if appended
  clean = clean.replace(/\.webp$/i, "");
  return clean;
}

/**
 * Custom Next.js Image loader for Cloudinary assets.
 * Usage with next/image: <Image loader={cloudinaryLoader} src={media.publicId} ... />
 */
export default function cloudinaryLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const cloudName = getCloudName();
  const id = cleanPublicId(src);

  if (!cloudName || !id) {
    return src;
  }

  const targetWidth = getNearestAllowedWidth(width);
  const transformation = `f_auto,q_auto,c_limit,w_${targetWidth}`;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${id}`;
}

export interface MediaRef {
  publicId: string;
}

/**
 * Builds fixed crop URLs for cover images (cards & Open Graph).
 */
export function coverUrl(
  mediaOrPublicId: string | MediaRef | null | undefined,
  ratio: "16/10" | "og"
): string {
  if (!mediaOrPublicId) return "";
  const rawId = typeof mediaOrPublicId === "string" ? mediaOrPublicId : mediaOrPublicId.publicId;
  const id = cleanPublicId(rawId);
  const cloudName = getCloudName();
  if (!cloudName || !id) return "";

  const transformation =
    ratio === "16/10"
      ? "c_fill,g_auto,w_1200,h_750"
      : "c_fill,g_auto,w_1200,h_630";

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${id}`;
}

/**
 * Builds fixed 300x300 thumbnail URL for the media library grid.
 */
export function mediaThumbUrl(mediaOrPublicId: string | MediaRef | null | undefined): string {
  if (!mediaOrPublicId) return "";
  const rawId = typeof mediaOrPublicId === "string" ? mediaOrPublicId : mediaOrPublicId.publicId;
  const id = cleanPublicId(rawId);
  const cloudName = getCloudName();
  if (!cloudName || !id) return "";

  return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,g_auto,w_300,h_300/${id}`;
}


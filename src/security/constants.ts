/**
 * Single source of truth for external domain allowlists used in Content Security Policy (CSP),
 * next.config.ts, and proxy verification.
 */

// Explicit allowlist for external image hosts (Cloudinary storage CDN)
const configuredCloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  "";

export const CLOUDINARY_ORIGIN = "https://res.cloudinary.com";

export const ALLOWED_IMAGE_HOSTS: readonly string[] = configuredCloudName
  ? [`https://res.cloudinary.com/${configuredCloudName}`]
  : ["https://res.cloudinary.com"];

// Exact allowed frame / embed origins (Google Maps and privacy-enhanced YouTube)
export const ALLOWED_FRAME_HOSTS: readonly string[] = [
  "https://www.youtube-nocookie.com",
  "https://www.google.com",
  "https://maps.google.com",
];

// Allowed production and development Host header origins
export const ALLOWED_HOSTS: readonly string[] = [
  "guruomdental.com",
  "www.guruomdental.com",
  "localhost:3000",
  "127.0.0.1:3000",
  "localhost",
  "127.0.0.1",
];

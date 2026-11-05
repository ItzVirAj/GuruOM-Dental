import "server-only";

const ALLOWED_YOUTUBE_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtube-nocookie.com",
]);

const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

export interface ParsedYouTubeResult {
  youtubeId: string;
  startSeconds: number | null;
}

export class YouTubeUrlParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "YouTubeUrlParseError";
  }
}

/**
 * Parses a start time string like "90", "90s", "1m30s", "1h2m3s", "1h", "2m" into total seconds.
 * Clamps result between 0 and 86399 (23 hours, 59 minutes, 59 seconds).
 */
export function parseStartSeconds(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const str = raw.trim().toLowerCase();
  if (!str) return null;

  // Pure integer seconds (e.g. "90" or "90s")
  const pureNumMatch = str.match(/^(\d+)s?$/);
  if (pureNumMatch) {
    const sec = parseInt(pureNumMatch[1], 10);
    if (isNaN(sec)) return null;
    return Math.max(0, Math.min(86399, sec));
  }

  // Combined formats like 1h2m3s, 1h30s, 2m10s, 1h, 5m
  const complexMatch = str.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (complexMatch && (complexMatch[1] || complexMatch[2] || complexMatch[3])) {
    const hours = parseInt(complexMatch[1] || "0", 10);
    const minutes = parseInt(complexMatch[2] || "0", 10);
    const seconds = parseInt(complexMatch[3] || "0", 10);

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    return Math.max(0, Math.min(86399, totalSeconds));
  }

  return null;
}

/**
 * Validates and extracts the 11-character YouTube video ID and optional start time from user input.
 * SSRF and parser hardened:
 * - Checks protocol (https required)
 * - Exact hostname whitelist match (no subdomains, evil lookalikes, or userinfo)
 * - Port restriction (default or 443 only)
 * - Rejects channels, playlists, search, usernames, and non-video paths
 * - Validates the 11-char ID with strict regex ^[A-Za-z0-9_-]{11}$
 */
export function parseYouTubeUrl(rawInput: string): ParsedYouTubeResult {
  if (!rawInput || typeof rawInput !== "string") {
    throw new YouTubeUrlParseError("Please provide a valid YouTube URL.");
  }

  const trimmed = rawInput.trim();
  if (trimmed.length > 500) {
    throw new YouTubeUrlParseError("URL exceeds maximum length.");
  }

  // Reject control characters or newlines
  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    throw new YouTubeUrlParseError("URL contains illegal control characters.");
  }

  // Normalise input: if bare domain without scheme, prefix https://
  let urlToParse = trimmed;
  const lowerInput = urlToParse.toLowerCase();
  if (
    !lowerInput.startsWith("http://") &&
    !lowerInput.startsWith("https://")
  ) {
    if (
      lowerInput.startsWith("youtu.be/") ||
      lowerInput.startsWith("youtube.com/") ||
      lowerInput.startsWith("www.youtube.com/") ||
      lowerInput.startsWith("m.youtube.com/") ||
      lowerInput.startsWith("www.youtube-nocookie.com/")
    ) {
      urlToParse = `https://${urlToParse}`;
    } else {
      throw new YouTubeUrlParseError(
        "Please enter a complete YouTube URL starting with https://"
      );
    }
  }

  let parsed: URL;
  try {
    parsed = new URL(urlToParse);
  } catch {
    throw new YouTubeUrlParseError("Malformed URL structure.");
  }

  // Scheme must be strictly https
  if (parsed.protocol !== "https:") {
    throw new YouTubeUrlParseError("Only secure HTTPS YouTube links are accepted.");
  }

  // Userinfo is strictly forbidden (e.g. https://youtube.com@evil.com)
  if (parsed.username || parsed.password) {
    throw new YouTubeUrlParseError("URL credentials or userinfo are not permitted.");
  }

  // Non-standard ports forbidden
  if (parsed.port && parsed.port !== "443") {
    throw new YouTubeUrlParseError("Non-standard ports are not allowed.");
  }

  // Hostname must strictly match allowlist
  const hostname = parsed.hostname.toLowerCase();
  if (!ALLOWED_YOUTUBE_HOSTS.has(hostname)) {
    throw new YouTubeUrlParseError(
      `Unsupported video host "${hostname}". Only official YouTube domains are accepted.`
    );
  }

  // Reject non-video surfaces
  const pathname = parsed.pathname;
  if (
    pathname.startsWith("/playlist") ||
    pathname.startsWith("/channel/") ||
    pathname.startsWith("/c/") ||
    pathname.startsWith("/user/") ||
    pathname.startsWith("/@") ||
    pathname.startsWith("/results") ||
    pathname.startsWith("/feed") ||
    pathname.startsWith("/explore")
  ) {
    throw new YouTubeUrlParseError(
      "Only direct video links are supported (playlists, channels, users, and search results are not supported)."
    );
  }

  let rawId: string | null = null;

  if (hostname === "youtu.be") {
    // Path is /<id>
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 1) {
      rawId = segments[0];
    } else {
      throw new YouTubeUrlParseError("Invalid youtu.be path format.");
    }
  } else {
    // Domain is youtube.com, www.youtube.com, m.youtube.com, or www.youtube-nocookie.com
    if (pathname === "/watch") {
      rawId = parsed.searchParams.get("v");
      if (!rawId) {
        throw new YouTubeUrlParseError("Missing video ID parameter ('?v=') in watch URL.");
      }
    } else if (
      pathname.startsWith("/shorts/") ||
      pathname.startsWith("/embed/") ||
      pathname.startsWith("/live/")
    ) {
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length >= 2) {
        rawId = segments[1];
      } else {
        throw new YouTubeUrlParseError("Invalid video path format.");
      }
    } else {
      throw new YouTubeUrlParseError(
        "Unsupported YouTube URL format. Please provide a /watch, /shorts, /embed, /live, or youtu.be link."
      );
    }
  }

  if (!rawId || !YOUTUBE_ID_REGEX.test(rawId)) {
    throw new YouTubeUrlParseError(
      `Invalid YouTube video ID "${rawId || ""}". YouTube IDs must be exactly 11 characters (letters, numbers, hyphen, underscore).`
    );
  }

  // Extract start time from t or start query params
  const rawStart = parsed.searchParams.get("t") || parsed.searchParams.get("start");
  const startSeconds = parseStartSeconds(rawStart);

  return {
    youtubeId: rawId,
    startSeconds,
  };
}

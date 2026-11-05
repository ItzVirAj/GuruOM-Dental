import { generateCspHeader, type CspProfile } from "./csp";

export interface SecurityHeadersOptions {
  profile: CspProfile;
  nonce?: string;
  isApi?: boolean;
  isHttps?: boolean;
}

export interface HeaderEntry {
  key: string;
  value: string;
}

/**
 * Returns the unified set of hardened HTTP security headers for a given request.
 */
export function getSecurityHeaders(options: SecurityHeadersOptions): Record<string, string> {
  const isProduction = process.env.NODE_ENV === "production";
  const isHttps = options.isHttps ?? isProduction;
  const isOwner = options.profile === "owner";

  const headers: Record<string, string> = {
    // 1. MIME Sniffing protection
    "X-Content-Type-Options": "nosniff",

    // 2. Clickjacking protection (legacy header matching CSP frame-ancestors 'none')
    "X-Frame-Options": "DENY",

    // 3. Referrer Policy (strict privacy for owner area, standard for public)
    "Referrer-Policy": isOwner ? "no-referrer" : "strict-origin-when-cross-origin",

    // 4. Cross-Origin Opener Policy
    "Cross-Origin-Opener-Policy": "same-origin",

    // 5. Permissions Policy (Hardware and sensor access denied)
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), display-capture=(), midi=(), sync-xhr=()",
  };

  // 6. Strict-Transport-Security (HSTS): max-age 1 year, subdomains, production over HTTPS only (no preload)
  if (isProduction && isHttps) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }

  // 7. Cache-Control for Owner Portal and API routes (Strict No-Store)
  if (isOwner || options.isApi) {
    headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate";
    headers["Pragma"] = "no-cache";
    headers["Expires"] = "0";
  }

  // 8. Owner Search Engine Exclusions
  if (isOwner) {
    headers["X-Robots-Tag"] = "noindex, nofollow, noarchive";
  }

  // 9. Content Security Policy (profile-driven)
  const csp = generateCspHeader({
    profile: options.profile,
    nonce: options.nonce,
  });
  headers[csp.headerName] = csp.headerValue;

  return headers;
}

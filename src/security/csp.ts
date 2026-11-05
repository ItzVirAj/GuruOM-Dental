import { ALLOWED_IMAGE_HOSTS, ALLOWED_FRAME_HOSTS } from "./constants";

export type CspProfile = "owner" | "public";

export interface CspOptions {
  profile: CspProfile;
  nonce?: string;
  isDev?: boolean;
}

export interface CspResult {
  headerName: "Content-Security-Policy" | "Content-Security-Policy-Report-Only";
  headerValue: string;
}

/**
 * Generates the Content Security Policy header based on the target profile (owner vs public),
 * whether nonces are used, and the configured CSP_MODE (report-only vs enforce).
 */
export function generateCspHeader(options: CspOptions): CspResult {
  const isDev = options.isDev ?? process.env.NODE_ENV === "development";
  const mode = process.env.CSP_MODE?.toLowerCase() === "enforce" ? "enforce" : "report-only";
  const headerName =
    mode === "enforce"
      ? "Content-Security-Policy"
      : "Content-Security-Policy-Report-Only";

  const imgSources = ["'self'", "data:", "blob:", ...ALLOWED_IMAGE_HOSTS].join(" ");
  const frameSources =
    options.profile === "owner" ? "'none'" : ALLOWED_FRAME_HOSTS.join(" ");

  let policy: string;

  if (options.profile === "owner") {
    // ------------------------------------------------------------------------
    // OWNER AREA PROFILE: Strict Nonce-Based
    // Dynamic pages allow fresh cryptographic nonces with zero cache penalty.
    // ------------------------------------------------------------------------
    const nonce = options.nonce || "";
    const scriptSrc = nonce
      ? `'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`
      : `'self'${isDev ? " 'unsafe-eval'" : ""}`;
    const styleSrc = nonce ? `'self' 'nonce-${nonce}'` : "'self'";

    policy = `
      default-src 'none';
      script-src ${scriptSrc};
      style-src ${styleSrc};
      style-src-attr 'unsafe-inline';
      img-src ${imgSources};
      font-src 'self';
      connect-src 'self';
      frame-src ${frameSources};
      form-action 'self';
      base-uri 'none';
      object-src 'none';
      frame-ancestors 'none';
      report-uri /api/csp-report;
      report-to csp-endpoint;
    `;
  } else {
    // ------------------------------------------------------------------------
    // PUBLIC PAGES PROFILE: Static-Friendly Pragmatic Policy
    // Does not use per-request nonces to preserve full static optimization,
    // ISR, and CDN caching of public pages.
    // ------------------------------------------------------------------------
    const scriptSrc = `'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`;
    const styleSrc = "'self' 'unsafe-inline'";
    const upgradeInsecure = !isDev ? "upgrade-insecure-requests;" : "";

    policy = `
      default-src 'self';
      script-src ${scriptSrc};
      style-src ${styleSrc};
      img-src ${imgSources};
      font-src 'self';
      connect-src 'self';
      frame-src ${frameSources};
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      ${upgradeInsecure}
      report-uri /api/csp-report;
      report-to csp-endpoint;
    `;
  }

  // Normalize whitespace to single line
  const headerValue = policy
    .replace(/\s{2,}/g, " ")
    .replace(/\s*;\s*/g, "; ")
    .trim();

  return { headerName, headerValue };
}

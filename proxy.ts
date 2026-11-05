import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSecurityHeaders } from "./src/security/headers";

const COMMON_PROBE_PATHS = [
  "/admin",
  "/administrator",
  "/login",
  "/wp-login.php",
  "/wp-admin",
  "/dashboard",
  "/owner",
  "/cms",
  "/panel",
  "/manage",
  "/backend",
  "/staff",
];

function isAllowedHost(hostHeader: string | null): boolean {
  if (!hostHeader) return false;
  const hostname = hostHeader.split(":")[0].toLowerCase().trim();

  // Development & loopback hosts
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;

  // Canonical production domains
  if (hostname === "guruomdental.com" || hostname === "www.guruomdental.com") return true;

  // Explicit SITE_URL from environment
  const siteUrl = process.env.SITE_URL;
  if (siteUrl) {
    try {
      const parsed = new URL(siteUrl);
      if (hostname === parsed.hostname.toLowerCase()) return true;
    } catch {}
  }

  // Preview deployments on Vercel
  if (hostname.endsWith(".vercel.app")) return true;

  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminPath = process.env.ADMIN_PATH?.trim();
  const method = request.method.toUpperCase();

  // 1. Defense-in-depth: Reject middleware bypass header
  if (request.headers.has("x-middleware-subrequest")) {
    return new NextResponse("Bad Request: Unauthorized subrequest", {
      status: 400,
    });
  }

  // 2. Host header allowlist enforcement
  const host = request.headers.get("host") || request.headers.get("x-forwarded-host");
  if (!isAllowedHost(host)) {
    return new NextResponse("Bad Request: Unrecognized or invalid Host header", {
      status: 400,
    });
  }

  // 3. Method allowlist for /api/** and owner routes
  if (pathname.startsWith("/api/")) {
    if (pathname.startsWith("/api/auth/")) {
      if (method !== "GET" && method !== "POST") {
        return new NextResponse("Method Not Allowed", {
          status: 405,
          headers: { Allow: "GET, POST" },
        });
      }
    } else if (pathname === "/api/blog" || pathname.startsWith("/api/blog/")) {
      if (method !== "GET") {
        return new NextResponse("Method Not Allowed", {
          status: 405,
          headers: { Allow: "GET" },
        });
      }
    } else if (pathname === "/api/csp-report") {
      if (method !== "POST") {
        return new NextResponse("Method Not Allowed", {
          status: 405,
          headers: { Allow: "POST" },
        });
      }
    } else if (pathname === "/api/cron/maintenance") {
      if (method !== "GET") {
        return new NextResponse("Method Not Allowed", {
          status: 405,
          headers: { Allow: "GET" },
        });
      }
    } else {
      if (method !== "GET" && method !== "POST") {
        return new NextResponse("Method Not Allowed", {
          status: 405,
          headers: { Allow: "GET, POST" },
        });
      }
    }
  }

  // 4. Direct external requests to /ow or /ow/* must return 404 (route masquerade)
  if (pathname === "/ow" || pathname.startsWith("/ow/")) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), {
      status: 404,
    });
  }

  // 5. Disavowed auth endpoints (public sign-up is completely disabled)
  if (pathname === "/api/auth/sign-up" || pathname.startsWith("/api/auth/sign-up/")) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), {
      status: 404,
    });
  }

  // 6. Strict same-origin verification for state-changing auth mutations
  if (pathname.startsWith("/api/auth/")) {
    const secFetchSite = request.headers.get("sec-fetch-site");
    if (secFetchSite && secFetchSite === "cross-site") {
      return new NextResponse(
        JSON.stringify({ error: "Forbidden: Cross-site requests rejected." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const origin = request.headers.get("origin");
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return new NextResponse(
            JSON.stringify({ error: "Forbidden: Origin mismatch." }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
      } catch {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden: Invalid origin." }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  // 7. Common administrative probe paths return normal 404 (never redirect to the secret path)
  for (const probe of COMMON_PROBE_PATHS) {
    if (pathname === probe || pathname.startsWith(`${probe}/`)) {
      return NextResponse.rewrite(new URL("/_not-found", request.url), {
        status: 404,
      });
    }
  }

  const isHttps = request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";

  // 8. Requests to secret /<ADMIN_PATH> are internally rewritten to /ow/*
  if (adminPath && (pathname === `/${adminPath}` || pathname.startsWith(`/${adminPath}/`))) {
    if (method !== "GET" && method !== "POST") {
      return new NextResponse("Method Not Allowed", {
        status: 405,
        headers: { Allow: "GET, POST" },
      });
    }

    const remainder = pathname.slice(`/${adminPath}`.length);
    const destinationPath = `/ow${remainder || ""}`;

    // Cryptographic nonce for owner area strict CSP
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);

    const response = NextResponse.rewrite(
      new URL(destinationPath, request.url),
      {
        request: {
          headers: requestHeaders,
        },
      }
    );

    // Apply strict owner area security headers with nonce-based CSP
    const secHeaders = getSecurityHeaders({
      profile: "owner",
      nonce,
      isHttps,
    });

    for (const [key, value] of Object.entries(secHeaders)) {
      response.headers.set(key, value);
    }

    return response;
  }

  // 9. Public pages and API responses: apply public security headers & CSP
  const isApi = pathname.startsWith("/api/");
  const response = NextResponse.next();

  const secHeaders = getSecurityHeaders({
    profile: "public",
    isApi,
    isHttps,
  });

  for (const [key, value] of Object.entries(secHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static image and font extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ico)$).*)",
  ],
};

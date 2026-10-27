import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminPath = process.env.ADMIN_PATH?.trim();

  // 1. Direct external requests to /ow or /ow/* must return 404 (pretend the route doesn't exist)
  if (pathname === "/ow" || pathname.startsWith("/ow/")) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), {
      status: 404,
    });
  }

  // 2. Common administrative probe paths return normal 404 (never redirect to the secret path)
  for (const probe of COMMON_PROBE_PATHS) {
    if (pathname === probe || pathname.startsWith(`${probe}/`)) {
      return NextResponse.rewrite(new URL("/_not-found", request.url), {
        status: 404,
      });
    }
  }

  // 3. Requests to secret /<ADMIN_PATH> are internally rewritten to /ow/*
  if (adminPath && (pathname === `/${adminPath}` || pathname.startsWith(`/${adminPath}/`))) {
    const remainder = pathname.slice(`/${adminPath}`.length);
    const destinationPath = `/ow${remainder || ""}`;

    const response = NextResponse.rewrite(
      new URL(destinationPath, request.url)
    );

    // Apply strict owner area security headers
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "no-referrer");

    return response;
  }

  return NextResponse.next();
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

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/src/server/security/rate-limit";
import { logger } from "@/src/lib/logger";

const MAX_PAYLOAD_BYTES = 10 * 1024; // 10 KB size cap

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  // 1. Rate Limiting check
  try {
    const rateCheck = await checkRateLimit("csp_report", ip);
    if (!rateCheck.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }
  } catch {
    // Fail closed
    return new NextResponse(
      JSON.stringify({ error: "Service unavailable" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Payload size check
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return new NextResponse(
      JSON.stringify({ error: "Payload too large" }),
      { status: 413, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. Read and sanitize violation report
  try {
    const text = await request.text();
    if (text.length > MAX_PAYLOAD_BYTES) {
      return new NextResponse(
        JSON.stringify({ error: "Payload too large" }),
        { status: 413, headers: { "Content-Type": "application/json" } }
      );
    }

    const json = JSON.parse(text);
    const report = json["csp-report"] || json;

    // Log violation without personal data or query strings
    const sanitizedViolation = {
      documentUri: String(report["document-uri"] || report.documentURL || "").split("?")[0],
      blockedUri: String(report["blocked-uri"] || report.blockedURL || "").split("?")[0],
      violatedDirective: String(report["violated-directive"] || report.effectiveDirective || ""),
      disposition: String(report.disposition || "report"),
    };

    logger.warn("[CSP_VIOLATION]", sanitizedViolation);

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(
      JSON.stringify({ error: "Invalid report format" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

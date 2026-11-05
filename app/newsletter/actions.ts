"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { checkRateLimit } from "@/src/server/security/rate-limit";
import { logger } from "@/src/lib/logger";

const newsletterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").max(120),
  honeypot: z.string().max(100).optional(),
});

export type NewsletterResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function subscribeNewsletter(
  formData: FormData | { email: string; honeypot?: string }
): Promise<NewsletterResult> {
  // 1. IP extraction & DB rate limiting
  const headerList = await headers();
  const clientIp =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "127.0.0.1";

  try {
    const rateCheck = await checkRateLimit("newsletter", clientIp);
    if (!rateCheck.allowed) {
      return {
        ok: false,
        message: "Too many subscription attempts. Please try again later.",
      };
    }
  } catch (err) {
    logger.error("[NEWSLETTER_RATE_LIMIT_ERROR]", err);
    return {
      ok: false,
      message: "Subscription service currently unavailable. Please try again shortly.",
    };
  }

  // 2. Parse and validate input
  const rawEmail =
    formData instanceof FormData
      ? String(formData.get("email") || "")
      : formData.email;
  const rawHoneypot =
    formData instanceof FormData
      ? String(formData.get("website") || formData.get("honeypot") || "")
      : formData.honeypot;

  const result = newsletterSchema.safeParse({
    email: rawEmail,
    honeypot: rawHoneypot,
  });

  if (!result.success) {
    return {
      ok: false,
      message: "Please enter a valid email address.",
    };
  }

  // 3. Honeypot check
  if (result.data.honeypot && result.data.honeypot.trim().length > 0) {
    return {
      ok: true,
      message: "Thank you for subscribing to GuruOm Dental health updates.",
    };
  }

  const email = result.data.email.toLowerCase();

  // 4. Log sanitized subscription event
  logger.info("[NEWSLETTER_SUBSCRIPTION]", {
    domain: email.split("@")[1] || "unknown",
    timestamp: new Date().toISOString(),
  });

  return {
    ok: true,
    message: "Thank you for subscribing to GuruOm Dental health updates.",
  };
}

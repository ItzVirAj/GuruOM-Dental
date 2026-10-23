"use server";

import { headers } from "next/headers";
import { contactFormSchema, ContactFormData } from "@/lib/contact";
import { checkRateLimit, extractClientIp } from "@/lib/rate-limit";
import {
  generateReferenceCode,
  isHoneypotTriggered,
  normalizeIndianPhone,
} from "@/lib/validation";

export type ContactSubmissionResult =
  | {
      ok: true;
      reference: string;
      message?: string;
    }
  | {
      ok: false;
      fieldErrors?: Record<string, string[]>;
      message: string;
    };

// ----------------------------------------------------------------------------
// CRM / Email Dispatcher Stub (TODO)
// ----------------------------------------------------------------------------
/**
 * TODO: PRODUCTION INTEGRATION
 * Connect this stub to Resend / SendGrid (Front desk enquiry inbox),
 * and Practice Management Software (PMS) or CRM lead pipeline.
 */
async function notifyClinicContact(
  contact: ContactFormData,
  reference: string
): Promise<void> {
  // Guard development logging to never leak PII into server log streams
  if (process.env.NODE_ENV !== "production") {
    // Intentionally sanitized debug statement (no phone or email printed)
    console.log(
      `[DEV-CONTACT-STUB] Enquiry received. Reference: ${reference}, Reason: ${contact.reason}, Message Length: ${contact.message.length}`
    );
  }

  // Simulate remote email/CRM API invocation latency
  await new Promise((resolve) => setTimeout(resolve, 350));
}

// ----------------------------------------------------------------------------
// Main Server Action
// ----------------------------------------------------------------------------
export async function submitContact(
  data: unknown
): Promise<ContactSubmissionResult> {
  // 1. IP extraction and Rate Limiting (Separate "contact" bucket from appointments)
  const headerList = await headers();
  const clientIp = extractClientIp(headerList);

  if (!checkRateLimit("contact", clientIp, 6, 10 * 60 * 1000)) {
    return {
      ok: false,
      message:
        "Too many message attempts from this network. Please wait a few minutes or call our front desk directly.",
    };
  }

  // 2. Validate input with Zod
  const parseResult = contactFormSchema.safeParse(data);

  if (!parseResult.success) {
    const errorFormatted = parseResult.error.flatten();
    return {
      ok: false,
      fieldErrors: errorFormatted.fieldErrors,
      message: "Please correct the highlighted fields and try again.",
    };
  }

  const validData = parseResult.data;

  // 3. Honeypot check: if website field is filled, silently discard and return fake success
  if (isHoneypotTriggered(validData.website)) {
    // Return fake confirmation to fool automated web scrapers
    return {
      ok: true,
      reference: "GOC-BOTTRAP-99",
      message: "Your message has been acknowledged.",
    };
  }

  // 4. Sanitize and normalize fields
  const normalizedContact: ContactFormData = {
    ...validData,
    fullName: validData.fullName.trim(),
    email: validData.email.trim().toLowerCase(),
    phone: validData.phone ? normalizeIndianPhone(validData.phone) : "",
    message: validData.message.trim(),
    reason: validData.reason,
    consent: true,
    website: "",
  };

  // 5. Generate secure, human-readable confirmation code (e.g. GOC-8R4W1Y)
  const reference = generateReferenceCode("GOC");

  try {
    // 6. Invoke notification pipeline stub
    await notifyClinicContact(normalizedContact, reference);

    return {
      ok: true,
      reference,
      message: "Thank you for reaching out. We will get back to you within 1 business day.",
    };
  } catch {
    return {
      ok: false,
      message:
        "We encountered an internal processing issue while sending your message. Please try again or call our clinic directly.",
    };
  }
}

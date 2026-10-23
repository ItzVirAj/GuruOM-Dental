"use server";

import { headers } from "next/headers";
import {
  combinedBookingSchema,
  normalizeIndianPhone,
  BookingFormData,
} from "@/lib/booking";
import { checkRateLimit, extractClientIp } from "@/lib/rate-limit";
import { generateReferenceCode, isHoneypotTriggered } from "@/lib/validation";

export type AppointmentSubmissionResult =
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
// CRM / WhatsApp / Email Dispatcher Stub (TODO)
// ----------------------------------------------------------------------------
/**
 * TODO: PRODUCTION INTEGRATION
 * Connect this stub to SendGrid/Resend (Doctor email notification),
 * Twilio/Gupshup (WhatsApp confirmation to patient),
 * and Practice Management Software (PMS) webhook.
 */
async function notifyClinic(
  booking: BookingFormData,
  reference: string
): Promise<void> {
  // Guard development logging to never leak PII into server log streams
  if (process.env.NODE_ENV !== "production") {
    // Intentionally sanitized debug statement (no phone or email printed)
    console.log(
      `[DEV-NOTIFICATION-STUB] Booking received. Reference: ${reference}, Service: ${booking.serviceSlug}, Doctor: ${booking.doctorSlug}, Date: ${booking.date} @ ${booking.timeSlot}`
    );
  }

  // Simulate remote API invocation latency
  await new Promise((resolve) => setTimeout(resolve, 350));
}

// ----------------------------------------------------------------------------
// Main Server Action
// ----------------------------------------------------------------------------
export async function submitAppointment(
  data: unknown
): Promise<AppointmentSubmissionResult> {
  // 1. IP extraction and Rate Limiting
  const headerList = await headers();
  const clientIp = extractClientIp(headerList);

  if (!checkRateLimit("appointment", clientIp)) {
    return {
      ok: false,
      message:
        "Too many booking attempts from this network. Please wait a few minutes or call our front desk directly.",
    };
  }

  // 2. Validate input with Zod
  const parseResult = combinedBookingSchema.safeParse(data);

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
      reference: "GOD-BOTTRAP-99",
      message: "Your appointment request has been acknowledged.",
    };
  }

  // 4. Sanitize and normalize fields
  const normalizedBooking: BookingFormData = {
    ...validData,
    fullName: validData.fullName.trim(),
    phone: normalizeIndianPhone(validData.phone),
    email: validData.email ? validData.email.trim().toLowerCase() : "",
    notes: validData.notes ? validData.notes.trim() : "",
  };

  // 5. Generate secure, human-readable confirmation code (e.g. GOD-7K2M9X)
  const reference = generateReferenceCode("GOD");

  try {
    // 6. Invoke notification pipeline stub
    await notifyClinic(normalizedBooking, reference);

    return {
      ok: true,
      reference,
      message: "Appointment request successfully reserved.",
    };
  } catch {
    return {
      ok: false,
      message:
        "We encountered an internal processing issue. Please try again or call our clinic directly.",
    };
  }
}

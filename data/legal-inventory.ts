/**
 * ============================================================================
 * CLINIC DATA & PRIVACY INVENTORY
 * ============================================================================
 * Update this file whenever the site's data handling changes, then review the
 * policy text.
 *
 * This inventory documents the actual, verifiable data collection and technical
 * behavior implemented in this codebase. The Privacy Policy and Terms of Use
 * are strictly grounded in these operational realities.
 * ============================================================================
 */

export interface FormInventoryItem {
  id: string;
  name: string;
  route: string;
  collectedFields: {
    field: string;
    type: string;
    required: boolean;
    purpose: string;
    clientStorage: "none" | "sessionStorage" | "localStorage";
  }[];
  submissionDestination: string;
  isImplemented: boolean;
}

export interface LegalInventory {
  lastAudited: string; // ISO date
  auditorNote: string;
  cookies: {
    used: boolean;
    details: string;
  };
  clientStorage: {
    sessionStorage: {
      used: boolean;
      keys: string[];
      retention: string;
      containsPii: boolean;
      description: string;
    };
    localStorage: {
      used: boolean;
      keys: string[];
      description: string;
    };
  };
  analyticsAndTracking: {
    installed: boolean;
    services: string[];
    description: string;
  };
  thirdPartyServices: {
    name: string;
    purpose: string;
    trigger: "page_load" | "user_click";
    dataTransmitted: string;
    activeToday: boolean;
  }[];
  forms: FormInventoryItem[];
  pendingIntegrations: {
    feature: string;
    plannedProvider: string;
    currentBehavior: string;
  }[];
}

export const legalDataInventory: LegalInventory = {
  lastAudited: "2026-10-23",
  auditorNote:
    "Audited against current codebase (Next.js App Router, in-memory rate limiting, server actions).",
  cookies: {
    used: false,
    details:
      "No first-party or third-party cookies are set or inspected by this application code. No cookie banner is required until tracking or authentication cookies are introduced.",
  },
  clientStorage: {
    sessionStorage: {
      used: true,
      keys: ["guruom_booking_draft_v1"],
      retention: "Cleared immediately upon booking submission or tab closure.",
      containsPii: false,
      description:
        "Used exclusively in the appointment booking wizard to preserve non-PII step selections (treatment, doctor preference, visit type, care plan, date, and time slot) across step transitions. Patient full name, phone number, email, and notes are strictly excluded from sessionStorage.",
    },
    localStorage: {
      used: false,
      keys: [],
      description: "No data is written to or read from window.localStorage.",
    },
  },
  analyticsAndTracking: {
    installed: false,
    services: [],
    description:
      "No analytics SDKs (such as Google Analytics, Mixpanel, Meta Pixel) or tag managers are installed. Web vitals or performance metrics are not transmitted to external telemetry servers.",
  },
  thirdPartyServices: [
    {
      name: "Google Maps (Embed Iframe)",
      purpose: "Interactive clinic navigation map on /contact",
      trigger: "user_click",
      dataTransmitted:
        "Zero external HTTP requests on initial page render. If an embed URL is configured, the iframe only loads after the user explicitly clicks 'Load Interactive Map'. If loaded, Google receives the visitor's IP address and browser headers subject to Google's privacy policy.",
      activeToday: false, // Currently empty placeholder; external link button used as fallback
    },
    {
      name: "Google Maps (External Link)",
      purpose: "Opens clinic plus code / address in Google Maps app or browser tab",
      trigger: "user_click",
      dataTransmitted: "Standard browser navigation link. No in-app data passed.",
      activeToday: true,
    },
    {
      name: "WhatsApp Direct Link",
      purpose: "Allows patients to initiate a WhatsApp chat with the clinic front desk",
      trigger: "user_click",
      dataTransmitted:
        "Opens wa.me URL with the clinic's phone number. No patient data is sent by the website itself.",
      activeToday: true,
    },
  ],
  forms: [
    {
      id: "appointment-booking",
      name: "Appointment Consultation Wizard",
      route: "/appointment",
      collectedFields: [
        { field: "serviceSlug", type: "string", required: true, purpose: "Selected treatment category", clientStorage: "sessionStorage" },
        { field: "doctorSlug", type: "string", required: true, purpose: "Preferred practitioner or any", clientStorage: "sessionStorage" },
        { field: "visitType", type: "enum", required: true, purpose: "First visit, follow-up, or urgent", clientStorage: "sessionStorage" },
        { field: "planId", type: "string", required: false, purpose: "Optional dental wellness plan reference", clientStorage: "sessionStorage" },
        { field: "date", type: "string (YYYY-MM-DD)", required: true, purpose: "Requested consultation date", clientStorage: "sessionStorage" },
        { field: "timeSlot", type: "string", required: true, purpose: "Requested time slot", clientStorage: "sessionStorage" },
        { field: "flexible", type: "boolean", required: false, purpose: "Whether patient schedule is flexible", clientStorage: "sessionStorage" },
        { field: "fullName", type: "string", required: true, purpose: "Patient identity for clinic records", clientStorage: "none" },
        { field: "phone", type: "string (Indian 10-digit)", required: true, purpose: "Appointment confirmation and SMS/call reminders", clientStorage: "none" },
        { field: "email", type: "string", required: false, purpose: "Optional digital appointment summary", clientStorage: "none" },
        { field: "notes", type: "string (max 500 chars)", required: false, purpose: "Non-sensitive scheduling preferences", clientStorage: "none" },
        { field: "consent", type: "boolean (true)", required: true, purpose: "Agreement to communication and clinic privacy policy", clientStorage: "none" },
        { field: "website", type: "string", required: false, purpose: "Honeypot anti-spam bot trap (discarded)", clientStorage: "none" },
      ],
      submissionDestination: "Next.js Server Action (submitAppointment in app/appointment/actions.ts)",
      isImplemented: true,
    },
    {
      id: "contact-inquiry",
      name: "General Contact & Feedback Form",
      route: "/contact",
      collectedFields: [
        { field: "fullName", type: "string", required: true, purpose: "Sender name", clientStorage: "none" },
        { field: "email", type: "string", required: true, purpose: "Reply destination", clientStorage: "none" },
        { field: "phone", type: "string (optional)", required: false, purpose: "Optional phone callback", clientStorage: "none" },
        { field: "reason", type: "enum", required: true, purpose: "Categorization of inquiry", clientStorage: "none" },
        { field: "message", type: "string (max 1000 chars)", required: true, purpose: "Inquiry details", clientStorage: "none" },
        { field: "consent", type: "boolean (true)", required: true, purpose: "Consent for clinic staff to respond", clientStorage: "none" },
        { field: "website", type: "string", required: false, purpose: "Honeypot anti-spam bot trap (discarded)", clientStorage: "none" },
      ],
      submissionDestination: "Next.js Server Action (submitContact in app/contact/actions.ts)",
      isImplemented: true,
    },
    {
      id: "newsletter-subscription",
      name: "Dental Health Newsletter Subscription",
      route: "Footer & /blog",
      collectedFields: [
        { field: "email", type: "string", required: true, purpose: "Delivery of clinic educational articles", clientStorage: "none" },
      ],
      submissionDestination: "Client handler stub (simulated dispatch)",
      isImplemented: false,
    },
  ],
  pendingIntegrations: [
    {
      feature: "Automated Email Notification",
      plannedProvider: "Resend / SendGrid [PLACEHOLDER]",
      currentBehavior: "Simulated in server action stub; no actual emails are dispatched to patients or clinic staff yet.",
    },
    {
      feature: "WhatsApp / SMS Notifications",
      plannedProvider: "Twilio / Gupshup [PLACEHOLDER]",
      currentBehavior: "Simulated in server action stub; no SMS or WhatsApp messages are dispatched yet.",
    },
    {
      feature: "Database / PMS Record Archival",
      plannedProvider: "PostgreSQL / Clinic Practice Management Software [PLACEHOLDER]",
      currentBehavior: "Data currently lives only in runtime memory during request execution; not saved to persistent database.",
    },
  ],
};

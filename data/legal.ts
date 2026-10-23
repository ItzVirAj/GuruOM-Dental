/**
 * DRAFT TEXT. NOT LEGAL ADVICE.
 * Have a qualified lawyer review and approve these documents before launch
 * and whenever the business or the site changes. Replace every [PLACEHOLDER].
 *
 * This file contains typed data structures for the Privacy Policy and Terms &
 * Conditions. All business-specific and statutory details that require verification
 * by legal counsel are marked with structured [PLACEHOLDER: ...] tokens.
 */

import { siteConfig } from "./site";

export interface LegalBlockParagraph {
  type: "paragraph";
  text: string;
}

export interface LegalBlockList {
  type: "list";
  ordered?: boolean;
  items: string[];
}

export interface LegalBlockNote {
  type: "note";
  tone?: "info" | "warning" | "alert";
  title?: string;
  text: string;
}

export type LegalBlock = LegalBlockParagraph | LegalBlockList | LegalBlockNote;

export interface LegalSection {
  id: string;
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  slug: "privacy" | "terms";
  title: string;
  lastUpdated: string; // ISO date
  version: string;
  intro: string;
  sections: LegalSection[];
}

/**
 * Hydration-safe date formatter using fixed locale and timeZone.
 */
export function formatLegalDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(d);
  } catch {
    return isoString;
  }
}

// ----------------------------------------------------------------------------
// PRIVACY POLICY DATA
// ----------------------------------------------------------------------------
export const privacyPolicyData: LegalDocument = {
  slug: "privacy",
  title: "Privacy Policy",
  lastUpdated: "2026-10-23",
  version: "1.0",
  intro:
    "At GuruOm Dental, we take the confidentiality of your personal details and healthcare inquiries seriously. This Privacy Policy explains transparently what data our website collects, how we process it, who has access to it, and your statutory rights under applicable privacy legislation.",
  sections: [
    {
      id: "who-we-are",
      heading: "1. Who We Are and How to Contact Us",
      blocks: [
        {
          type: "paragraph",
          text: `This website is operated by [PLACEHOLDER: Legal Entity Name, e.g., GuruOm Dental Healthcare LLP], a clinical dental practice registered under [PLACEHOLDER: Clinic Registration / Clinical Establishment Act License Number] located at ${siteConfig.address.full}.`,
        },
        {
          type: "paragraph",
          text: `In this Privacy Policy, references to "we", "us", "our", or "the clinic" refer to [PLACEHOLDER: Legal Entity Name]. For any questions regarding your data privacy, you can reach our front desk team at ${siteConfig.email} or by phone at ${siteConfig.phone}.`,
        },
      ],
    },
    {
      id: "information-we-collect",
      heading: "2. What Information We Collect",
      blocks: [
        {
          type: "paragraph",
          text: "We collect only the minimum personal data necessary to schedule dental appointments, reply to inquiries, and deliver requested communications. Based on the features on this website, data collection is limited to:",
        },
        {
          type: "list",
          items: [
            "Appointment Booking Form (/appointment): We collect your chosen treatment category, preferred doctor, visit type, desired consultation date and time slot, full name, 10-digit mobile phone number, optional email address, and optional non-medical scheduling notes.",
            "Contact Form (/contact): We collect your full name, email address, optional phone number, reason for inquiry, and your message.",
            "Newsletter Subscription Form (Footer & /blog): We collect your email address when you voluntarily sign up for dental wellness articles.",
            "Technical Rate-Limiting Data: When you submit an online form, our server temporarily processes your IP address in memory to protect the clinic from automated spam and Denial of Service (DoS) attacks. This technical identifier is not stored in a persistent database.",
          ],
        },
        {
          type: "note",
          tone: "info",
          title: "Sensitive Health Information Notice",
          text: "We deliberately request that you do not submit sensitive medical histories, diagnostic imaging (X-rays), or prescription details through our public website forms. All diagnostic health records are gathered confidentially in-person at the clinic.",
        },
      ],
    },
    {
      id: "why-we-use-it",
      heading: "3. Why We Use Your Information",
      blocks: [
        {
          type: "paragraph",
          text: "We process your personal information strictly for legitimate healthcare and communication purposes, specifically:",
        },
        {
          type: "list",
          items: [
            "Coordinating, scheduling, and confirming your requested dental consultation.",
            "Contacting you via telephone or SMS/WhatsApp to verify appointment availability or handle schedule changes.",
            "Responding to your queries, feedback, or treatment inquiries submitted through our contact form.",
            "Sending clinic newsletters, educational oral health advice, and preventive tips, but only if you have explicitly subscribed.",
            "Preventing fraudulent submissions, spam, and technical abuse of our digital booking systems.",
          ],
        },
      ],
    },
    {
      id: "legal-basis",
      heading: "4. Legal Basis and Consent",
      blocks: [
        {
          type: "paragraph",
          text: "We collect and process your personal information based on your voluntary consent, provided when you check the mandatory consent checkbox prior to submitting an appointment or contact inquiry.",
        },
        {
          type: "note",
          tone: "warning",
          title: "Legal Basis Verification",
          text: "[PLACEHOLDER: Legal counsel must confirm the statutory legal basis under the Digital Personal Data Protection Act (DPDPA) 2023 and relevant Indian healthcare data regulations, including consent notices and legitimate uses for medical appointments.]",
        },
      ],
    },
    {
      id: "who-we-share-with",
      heading: "5. Who We Share Your Information With",
      blocks: [
        {
          type: "paragraph",
          text: "We do not sell, rent, or trade your personal information to third-party advertisers or data brokers. Your details are accessible only to:",
        },
        {
          type: "list",
          items: [
            "Authorized Clinic Staff: Treating dentists, dental hygienists, and front desk receptionists who require the information to manage your schedule and patient care.",
            "IT Infrastructure Providers: Trusted technology vendors that host our web servers, serverless compute functions, and application code under strict contractual confidentiality obligations [PLACEHOLDER: Name cloud hosting providers, e.g., Vercel / AWS].",
            "Communication Gateways (When integrated): Transactional email and SMS/WhatsApp delivery gateways [PLACEHOLDER: Mention email/SMS vendors such as Resend, Twilio, or Gupshup once connected].",
            "Legal & Regulatory Authorities: Where required to comply with court orders, statutory medical oversight regulations, or valid requests from law enforcement agencies under applicable Indian laws.",
          ],
        },
      ],
    },
    {
      id: "third-party-content",
      heading: "6. Third-Party Content and External Services",
      blocks: [
        {
          type: "paragraph",
          text: "To provide essential patient services like location maps and direct messaging, our website links to external platforms:",
        },
        {
          type: "list",
          items: [
            "Interactive Map Embed: On our Contact page, the Google Maps embed does not load automatically upon page render. It only loads after you click 'Load Interactive Map'. Once clicked, Google's servers receive your browser request and IP address, subject to Google's Privacy Policy.",
            "Direct Navigation Links: Clicking 'Open in Google Maps', 'Get Directions', or social media icons opens external services in a new tab. These third-party websites operate independently under their own privacy notices.",
            "WhatsApp Chat: Clicking our WhatsApp chat button opens the WhatsApp application or web portal. GuruOm Dental does not transmit your website browsing history to WhatsApp.",
          ],
        },
      ],
    },
    {
      id: "cookies-and-storage",
      heading: "7. Cookies and Client Storage",
      blocks: [
        {
          type: "paragraph",
          text: "We believe in digital minimalism and privacy by design:",
        },
        {
          type: "list",
          items: [
            "Cookies: GuruOm Dental does not use first-party or third-party cookies. We do not place tracking cookies, advertising identifiers, or cross-site tracking tags on your device.",
            "Web Analytics: We do not run third-party telemetry scripts (such as Google Analytics or Meta Pixel) that profile user behavior across the web.",
            "Session Storage: In our multi-step appointment wizard (/appointment), we use your browser's temporary sessionStorage (key: 'guruom_booking_draft_v1') solely to preserve your non-personal treatment selections (treatment type, doctor preference, date, and time slot) as you advance through steps. Your full name, phone number, email address, and notes are NEVER stored in sessionStorage. This temporary data is automatically purged as soon as you submit the request or close the browser tab.",
            "Local Storage: We do not store any information in window.localStorage.",
          ],
        },
        {
          type: "note",
          tone: "info",
          title: "Future Analytics Notice",
          text: "If GuruOm Dental implements privacy-respecting analytics or patient portal login sessions in the future, this section will be updated and an appropriate cookie/consent notice will be displayed where legally mandated.",
        },
      ],
    },
    {
      id: "data-retention",
      heading: "8. How Long We Keep Your Information",
      blocks: [
        {
          type: "paragraph",
          text: "We retain personal information only for as long as necessary to fulfill the clinical and administrative purposes for which it was gathered:",
        },
        {
          type: "list",
          items: [
            "Website Inquiries & Appointment Requests: Retained for [PLACEHOLDER: Retention period, e.g., 90 days following inquiry resolution or conversion into an in-clinic patient chart].",
            "Medical & Dental Records: Once you attend an in-person consultation, clinical records are maintained in accordance with statutory medical record retention guidelines [PLACEHOLDER: Clinical Establishment Act / National Medical Commission / Dental Council of India guidelines, typically 3 to 8 years].",
            "Newsletter Subscriptions: Retained until you request unsubscription or withdrawal of consent.",
            "Technical Rate-Limit Logs: Stored ephemerally in server memory and discarded after 15 minutes.",
          ],
        },
      ],
    },
    {
      id: "data-protection",
      heading: "9. How We Protect Your Information",
      blocks: [
        {
          type: "paragraph",
          text: "We maintain appropriate technical and organizational safeguards designed to protect your personal details against unauthorized access, loss, alteration, or disclosure. These measures include:",
        },
        {
          type: "list",
          items: [
            "Strict TLS/HTTPS encryption across every page and form submission on our website.",
            "Separation of patient identifiable details from browser storage.",
            "Restricted administrative access granted only to verified clinic staff on a need-to-know basis.",
            "Honeypot form fields and rate-limiting safeguards to prevent automated extraction or submission spam.",
          ],
        },
        {
          type: "paragraph",
          text: "While we implement industry-standard precautions, no digital transmission over the internet can be guaranteed as 100% impenetrable. We encourage you to notify us immediately if you suspect any compromise of your communication with our clinic.",
        },
      ],
    },
    {
      id: "your-rights",
      heading: "10. Your Rights and How to Exercise Them",
      blocks: [
        {
          type: "paragraph",
          text: "Under applicable data protection legislation, you enjoy important rights regarding your personal information:",
        },
        {
          type: "list",
          items: [
            "Right to Access: You may request confirmation of whether we hold your personal data and obtain a summary of that information.",
            "Right to Correction: You may ask us to rectify inaccurate or incomplete records.",
            "Right to Erasure: You may request the deletion of your website inquiry data, subject to statutory retention requirements for clinical medical charts.",
            "Right to Withdraw Consent: You can withdraw your consent for email newsletters or non-essential communications at any time.",
            "Right of Grievance Redressal: You have the right to register a grievance with our designated Grievance Officer.",
          ],
        },
        {
          type: "paragraph",
          text: `To exercise any of these rights, please email us at ${siteConfig.email}. We aim to review and respond to verifiable requests within [PLACEHOLDER: Response time, e.g., 30 calendar days].`,
        },
      ],
    },
    {
      id: "childrens-information",
      heading: "11. Children's Information",
      blocks: [
        {
          type: "paragraph",
          text: "Our website is not designed for independent use by children under the age of 18 without parental oversight. Pediatric dental appointments for minors must be requested and authorized by a parent or legal guardian.",
        },
        {
          type: "paragraph",
          text: "If we learn that personal details have been inadvertently submitted by an unaccompanied child without verified parental consent, we will take prompt steps to delete that data from our inquiry queues.",
        },
      ],
    },
    {
      id: "health-information-disclaimer",
      heading: "12. In-Person Medical Evaluation",
      blocks: [
        {
          type: "paragraph",
          text: "Please remember that digital messages sent through our website contact or booking forms do not constitute a formal clinical diagnosis or dental chart. Dental treatments require a thorough clinical examination, diagnostic radiographs, and in-person assessment by a qualified doctor.",
        },
        {
          type: "paragraph",
          text: "Do not delay seeking emergency or routine dental advice based on any general informational content published on our website.",
        },
      ],
    },
    {
      id: "changes-to-policy",
      heading: "13. Changes to This Privacy Policy",
      blocks: [
        {
          type: "paragraph",
          text: "We may update this Privacy Policy periodically to reflect technological changes, expanded clinical services, or new regulatory standards. When updates occur, the revised version will be published on this page with an updated 'Last Updated' date at the top.",
        },
        {
          type: "paragraph",
          text: "We recommend reviewing this page periodically to stay informed about how we safeguard your data.",
        },
      ],
    },
    {
      id: "grievance-officer",
      heading: "14. Grievance Officer and Regulatory Contact",
      blocks: [
        {
          type: "paragraph",
          text: "In accordance with Indian Information Technology and Data Protection provisions, our designated Grievance Officer for data protection matters is:",
        },
        {
          type: "list",
          items: [
            "Name: [PLACEHOLDER: Grievance Officer Name, e.g., Dr. Guru Sharma / Clinic Administrator]",
            "Designation: [PLACEHOLDER: Designation, e.g., Data Protection & Patient Grievance Officer]",
            "Email: [PLACEHOLDER: Grievance Officer Email, e.g., grievance@guruomdental.com]",
            `Physical Address: ${siteConfig.address.full}`,
            `Phone: ${siteConfig.phone}`,
          ],
        },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// TERMS & CONDITIONS DATA
// ----------------------------------------------------------------------------
export const termsOfServiceData: LegalDocument = {
  slug: "terms",
  title: "Terms & Conditions",
  lastUpdated: "2026-10-23",
  version: "1.0",
  intro:
    "Welcome to GuruOm Dental. These Terms and Conditions govern your access to and use of our website, digital appointment scheduling requests, and informational resources. By browsing or submitting information through this site, you agree to these terms.",
  sections: [
    {
      id: "acceptance-of-terms",
      heading: "1. About These Terms and Acceptance",
      blocks: [
        {
          type: "paragraph",
          text: `These Terms and Conditions constitute a legally binding agreement between you (the visitor or prospective patient) and [PLACEHOLDER: Legal Entity Name, e.g., GuruOm Dental Healthcare LLP], operating as GuruOm Dental.`,
        },
        {
          type: "paragraph",
          text: "If you do not agree with any part of these terms, you should discontinue using our website. We reserve the right to revise these terms at our discretion, and your continued browsing signifies acceptance of updated terms.",
        },
      ],
    },
    {
      id: "medical-disclaimer",
      heading: "2. Information on This Website (Not Medical Advice)",
      blocks: [
        {
          type: "paragraph",
          text: "All material published on this website—including treatment descriptions, doctor biographies, smile care tips, blog articles, and pricing approximations—is provided solely for general educational and informational purposes.",
        },
        {
          type: "note",
          tone: "warning",
          title: "No Doctor-Patient Relationship Established",
          text: "Reading this website, using interactive tools, or submitting an online consultation form does NOT create a doctor-patient relationship between you and any dental practitioner at GuruOm Dental. A doctor-patient relationship is established only upon in-person clinical registration, mutual consent, and clinical examination at our dental facility.",
        },
        {
          type: "paragraph",
          text: "Never disregard professional dental or medical advice, or delay seeking it, because of something you have read on this website.",
        },
      ],
    },
    {
      id: "appointment-requests",
      heading: "3. Appointment Requests and Scheduling Policies",
      blocks: [
        {
          type: "paragraph",
          text: "Our online booking feature (/appointment) serves as an appointment request mechanism, not an immediate guaranteed reservation. When you submit a request:",
        },
        {
          type: "list",
          items: [
            "Confirmation Required: Your appointment is not finalized until our front desk verifies clinic chair availability and contacts you via telephone call, SMS, or WhatsApp to confirm.",
            "Doctor Availability: While we endeavor to honor your preferred clinician selection, doctor availability may change due to specialized surgical schedules, emergency procedures, or illness.",
            "Rescheduling & Cancellations: [PLACEHOLDER: Clinic Cancellation Policy, e.g., We kindly request at least 24 hours advance notice if you need to reschedule or cancel your visit. Repeated no-shows may require advance deposit for future bookings].",
            "Punctuality: Patients are requested to arrive 10 minutes prior to their scheduled time to complete necessary health disclosure paperwork.",
          ],
        },
      ],
    },
    {
      id: "pricing-and-plans",
      heading: "4. Pricing, Estimates, and Membership Plans",
      blocks: [
        {
          type: "paragraph",
          text: "Fee estimates, care package rates, and starting prices mentioned on our Pricing page (/pricing) are strictly indicative and subject to change following clinical diagnostic examination:",
        },
        {
          type: "list",
          items: [
            "Clinical Variation: Every oral anatomy is unique. Exact treatment costs depend on bone density, underlying decay, choice of restorative material (e.g., zirconia vs. ceramic), and procedural complexity.",
            "Written Estimates: Following your diagnostic consultation and digital X-rays, our clinical team will provide a transparent, itemized written treatment plan before initiating any non-emergency treatment.",
            "Wellness Plans: [PLACEHOLDER: Clinic Membership Plan Terms, e.g., GuruOm Dental Care Plans are subject to separate enrollment agreements detailing excluded complex treatments, maximum annual benefits, and transferability].",
          ],
        },
      ],
    },
    {
      id: "emergencies",
      heading: "5. Dental and Medical Emergencies",
      blocks: [
        {
          type: "note",
          tone: "alert",
          title: "Do Not Use Online Forms for Immediate Emergencies",
          text: `Website contact and appointment forms are not monitored 24 hours a day. If you are experiencing acute facial trauma, uncontrolled bleeding, severe swelling affecting breathing or swallowing, or unmanageable dental pain, call our emergency line immediately at ${siteConfig.emergencyPhone} or report to the nearest hospital casualty department.`,
        },
      ],
    },
    {
      id: "acceptable-use",
      heading: "6. Acceptable Use of the Website",
      blocks: [
        {
          type: "paragraph",
          text: "When interacting with this website, you agree to act lawfully and ethically. You shall not:",
        },
        {
          type: "list",
          items: [
            "Use automated spiders, scrapers, or bots to harvest content, doctor profiles, or pricing without written permission.",
            "Submit misleading, fraudulent, or impersonated identity details through our appointment or contact forms.",
            "Transmit spam, computer viruses, Trojan horses, or harmful code designed to disrupt clinic IT operations.",
            "Attempt to gain unauthorized access to our web hosting servers, administrative endpoints, or network infrastructure.",
          ],
        },
      ],
    },
    {
      id: "intellectual-property",
      heading: "7. Intellectual Property Rights",
      blocks: [
        {
          type: "paragraph",
          text: `All content on this website—including text, graphics, logos, icons, photographic layouts, animations, design tokens, and software code—is the property of [PLACEHOLDER: Legal Entity Name] or its licensors and is protected by Indian and international copyright and trademark laws.`,
        },
        {
          type: "paragraph",
          text: "You are granted a limited, revocable license to access and print individual pages for personal, non-commercial reference only. Reproduction, modification, distribution, or public republishing of our articles or imagery without prior written consent is strictly prohibited.",
        },
      ],
    },
    {
      id: "third-party-links",
      heading: "8. Third-Party Links and External Content",
      blocks: [
        {
          type: "paragraph",
          text: "Our website contains links to third-party web pages, including Google Maps, Instagram, YouTube, and WhatsApp. These links are provided solely as a convenience to our visitors.",
        },
        {
          type: "paragraph",
          text: "We do not endorse, inspect, or exercise control over the content, security, or terms of third-party platforms, and we accept no liability for any loss or harm resulting from your interaction with external websites.",
        },
      ],
    },
    {
      id: "limitation-of-liability",
      heading: "9. Disclaimers and Limitation of Liability",
      blocks: [
        {
          type: "paragraph",
          text: "This website and all materials therein are provided on an 'as is' and 'as available' basis, without warranties of any kind, whether express, statutory, or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement.",
        },
        {
          type: "note",
          tone: "warning",
          title: "Legal Counsel Review",
          text: "[PLACEHOLDER: Legal counsel must verify this limitation clause under applicable Indian consumer and contract jurisprudence: To the fullest extent permitted by law, GuruOm Dental and its directors, clinicians, and contractors shall not be liable for any indirect, incidental, special, punitive, or consequential damages resulting from website downtime, form submission failures, or reliance on website content.]",
        },
      ],
    },
    {
      id: "governing-law",
      heading: "10. Governing Law and Jurisdiction",
      blocks: [
        {
          type: "paragraph",
          text: "These Terms and Conditions, your website usage, and any disputes arising out of or connected with this website shall be governed by and construed in accordance with the substantive laws of India.",
        },
        {
          type: "paragraph",
          text: "You agree that the competent civil courts located in [PLACEHOLDER: Governing City, e.g., Ahilyanagar / Pune, Maharashtra, India] shall have exclusive jurisdiction over any legal proceedings or litigation relating to these Terms.",
        },
      ],
    },
    {
      id: "changes-to-terms",
      heading: "11. Changes to These Terms",
      blocks: [
        {
          type: "paragraph",
          text: "We reserve the right to revise, supplement, or replace these Terms and Conditions at any time. Changes take immediate effect once published on this page with an updated revision date.",
        },
        {
          type: "paragraph",
          text: "Your continued access to the website following any revisions constitutes your acknowledgement and binding acceptance of the modified Terms.",
        },
      ],
    },
    {
      id: "contact-information",
      heading: "12. Contact Information",
      blocks: [
        {
          type: "paragraph",
          text: "If you have questions, feedback, or concerns regarding these Terms & Conditions, please contact our administrative front desk:",
        },
        {
          type: "list",
          items: [
            `Clinic Name: ${siteConfig.name}`,
            `Physical Address: ${siteConfig.address.full}`,
            `Telephone: ${siteConfig.phone}`,
            `Email: ${siteConfig.email}`,
          ],
        },
      ],
    },
  ],
};

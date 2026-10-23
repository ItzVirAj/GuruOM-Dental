import { z } from "zod";
import { contactReasons } from "@/data/site";
import {
  INDIAN_PHONE_REGEX,
  honeypotSchema,
} from "./validation";

export const URGENT_CARE_NOTICE =
  "For urgent dental problems please call us instead of using this form.";

const contactReasonValues = contactReasons.map((r) => r.value) as [string, ...string[]];

export const contactFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name cannot exceed 80 characters."),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .max(120, "Email address is too long."),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => !val || INDIAN_PHONE_REGEX.test(val.replace(/[\s\-\(\)]/g, "")),
      {
        message: "Please enter a valid 10-digit Indian mobile number (e.g. 98765 43210).",
      }
    )
    .optional()
    .or(z.literal("")),
  reason: z.enum(contactReasonValues, {
    message: "Please select a valid reason for contacting us.",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Your message must be at least 10 characters long.")
    .max(1000, "Your message cannot exceed 1000 characters."),
  consent: z.literal(true, {
    message: "You must agree to our Privacy Policy to send an enquiry.",
  }),
  // Honeypot field for bot spam suppression. Must be empty.
  website: honeypotSchema,
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

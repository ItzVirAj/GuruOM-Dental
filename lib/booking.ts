import { z } from "zod";
import { servicesData } from "@/data/services";
import { doctorsData } from "@/data/doctors";
import { carePlans } from "@/data/pricing";

/**
 * Notice regarding sensitive health information per clinical compliance.
 */
export const SENSITIVE_HEALTH_NOTICE =
  "Please don't include sensitive medical details here. We will ask during your visit.";

export {
  INDIAN_PHONE_REGEX,
  normalizeIndianPhone,
  isValidIndianPhone,
  honeypotSchema,
} from "./validation";
import { INDIAN_PHONE_REGEX, honeypotSchema } from "./validation";

// ----------------------------------------------------------------------------
// Date & Closed Day Helpers
// ----------------------------------------------------------------------------
export const CLOSED_DAYS_OF_WEEK = [0]; // 0 = Sunday (placeholder: configurable)

export function isClosedDate(dateInput: string | Date): boolean {
  const d = typeof dateInput === "string" ? new Date(dateInput + "T00:00:00") : dateInput;
  if (isNaN(d.getTime())) return true;
  return CLOSED_DAYS_OF_WEEK.includes(d.getDay());
}

export function isDateInPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return target.getTime() < today.getTime();
}

export function isBeyondMaxBookingWindow(dateStr: string, maxDays = 60): boolean {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDays);
  maxDate.setHours(23, 59, 59, 999);
  const target = new Date(dateStr + "T00:00:00");
  return target.getTime() > maxDate.getTime();
}

// ----------------------------------------------------------------------------
// Time Slots Generator
// ----------------------------------------------------------------------------
export interface TimeSlot {
  id: string; // e.g. "09:00"
  time: string; // e.g. "9:00 AM"
  period: "Morning" | "Afternoon" | "Evening";
  available: boolean;
}

export function generateTimeSlotsForDate(dateStr: string): TimeSlot[] {
  if (!dateStr || isClosedDate(dateStr) || isDateInPast(dateStr)) {
    return [];
  }

  const targetDate = new Date(dateStr + "T00:00:00");
  const isSaturday = targetDate.getDay() === 6;
  const now = new Date();
  const isToday =
    targetDate.getFullYear() === now.getFullYear() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getDate() === now.getDate();

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Working Hours:
  // Mon-Fri: 9:00 AM - 8:30 PM (Last slot 8:00 PM)
  // Saturday: 9:00 AM - 6:00 PM (Last slot 5:30 PM)
  const slotDefinitions: Array<{
    hour24: number;
    minute: number;
    time: string;
    period: "Morning" | "Afternoon" | "Evening";
    saturdayAllowed: boolean;
  }> = [
    // Morning: 9:00 AM - 11:30 AM
    { hour24: 9, minute: 0, time: "9:00 AM", period: "Morning", saturdayAllowed: true },
    { hour24: 9, minute: 30, time: "9:30 AM", period: "Morning", saturdayAllowed: true },
    { hour24: 10, minute: 0, time: "10:00 AM", period: "Morning", saturdayAllowed: true },
    { hour24: 10, minute: 30, time: "10:30 AM", period: "Morning", saturdayAllowed: true },
    { hour24: 11, minute: 0, time: "11:00 AM", period: "Morning", saturdayAllowed: true },
    { hour24: 11, minute: 30, time: "11:30 AM", period: "Morning", saturdayAllowed: true },

    // Afternoon: 12:00 PM - 4:30 PM
    { hour24: 12, minute: 0, time: "12:00 PM", period: "Afternoon", saturdayAllowed: true },
    { hour24: 12, minute: 30, time: "12:30 PM", period: "Afternoon", saturdayAllowed: true },
    { hour24: 13, minute: 0, time: "1:00 PM", period: "Afternoon", saturdayAllowed: true },
    { hour24: 13, minute: 30, time: "1:30 PM", period: "Afternoon", saturdayAllowed: true },
    { hour24: 14, minute: 0, time: "2:00 PM", period: "Afternoon", saturdayAllowed: true },
    { hour24: 14, minute: 30, time: "2:30 PM", period: "Afternoon", saturdayAllowed: true },
    { hour24: 15, minute: 0, time: "3:00 PM", period: "Afternoon", saturdayAllowed: true },
    { hour24: 15, minute: 30, time: "3:30 PM", period: "Afternoon", saturdayAllowed: true },
    { hour24: 16, minute: 0, time: "4:00 PM", period: "Afternoon", saturdayAllowed: true },
    { hour24: 16, minute: 30, time: "4:30 PM", period: "Afternoon", saturdayAllowed: true },

    // Evening: 5:00 PM - 8:00 PM (Saturday ends at 5:30 PM)
    { hour24: 17, minute: 0, time: "5:00 PM", period: "Evening", saturdayAllowed: true },
    { hour24: 17, minute: 30, time: "5:30 PM", period: "Evening", saturdayAllowed: true },
    { hour24: 18, minute: 0, time: "6:00 PM", period: "Evening", saturdayAllowed: false },
    { hour24: 18, minute: 30, time: "6:30 PM", period: "Evening", saturdayAllowed: false },
    { hour24: 19, minute: 0, time: "7:00 PM", period: "Evening", saturdayAllowed: false },
    { hour24: 19, minute: 30, time: "7:30 PM", period: "Evening", saturdayAllowed: false },
    { hour24: 20, minute: 0, time: "8:00 PM", period: "Evening", saturdayAllowed: false },
  ];

  return slotDefinitions
    .filter((slot) => !isSaturday || slot.saturdayAllowed)
    .map((slot) => {
      const id = `${String(slot.hour24).padStart(2, "0")}:${String(slot.minute).padStart(2, "0")}`;

      // If booking for today, mark passed slots as unavailable
      let available = true;
      if (isToday) {
        if (
          slot.hour24 < currentHour ||
          (slot.hour24 === currentHour && slot.minute <= currentMinute + 15)
        ) {
          available = false;
        }
      }

      return {
        id,
        time: slot.time,
        period: slot.period,
        available,
      };
    });
}

// ----------------------------------------------------------------------------
// Zod Schemas
// ----------------------------------------------------------------------------

export const step1TreatmentSchema = z.object({
  serviceSlug: z
    .string()
    .min(1, "Please select a dental service.")
    .refine((slug) => servicesData.some((s) => s.slug === slug), {
      message: "Please select a valid service from our clinical list.",
    }),
  doctorSlug: z
    .string()
    .min(1, "Please select a preferred doctor or 'Any Available Doctor'.")
    .refine((slug) => slug === "any" || doctorsData.some((d) => d.slug === slug), {
      message: "Please choose a valid doctor or select 'any'.",
    }),
  visitType: z.enum(["first-visit", "follow-up", "emergency"], {
    message: "Please select the type of visit.",
  }),
  planId: z
    .string()
    .optional()
    .refine((id) => !id || carePlans.some((p) => p.id === id), {
      message: "Selected care plan is not recognized.",
    }),
});

export const step2DateTimeSchema = z.object({
  date: z
    .string()
    .min(1, "Please pick an appointment date.")
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), "Invalid date format.")
    .refine((val) => !isDateInPast(val), "Appointment date cannot be in the past.")
    .refine(
      (val) => !isBeyondMaxBookingWindow(val, 60),
      "Bookings can only be scheduled up to 60 days in advance."
    )
    .refine((val) => !isClosedDate(val), "The clinic is closed on this day (Sundays)."),
  timeSlot: z.string().min(1, "Please select an available time slot."),
  flexible: z.boolean().default(false),
});

export const step3DetailsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name cannot exceed 80 characters."),
  phone: z
    .string()
    .trim()
    .min(1, "Mobile phone number is required.")
    .refine((val) => INDIAN_PHONE_REGEX.test(val.replace(/[\s\-\(\)]/g, "")), {
      message: "Please enter a valid 10-digit Indian mobile number (e.g., 98765 43210).",
    }),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
  consent: z.literal(true, {
    message: "You must agree to the clinic privacy policy and communication terms.",
  }),
  // Honeypot field for bot spam prevention. Must be empty.
  website: honeypotSchema,
});

export const combinedBookingSchema = step1TreatmentSchema
  .merge(step2DateTimeSchema)
  .merge(step3DetailsSchema);

export type Step1TreatmentData = z.infer<typeof step1TreatmentSchema>;
export type Step2DateTimeData = z.infer<typeof step2DateTimeSchema>;
export type Step3DetailsData = z.infer<typeof step3DetailsSchema>;
export type BookingFormData = z.infer<typeof combinedBookingSchema>;

import { z } from "zod";

/**
 * ============================================================================
 * SHARED VALIDATION & DATA SANITIZATION HELPERS
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// Indian Mobile Phone Regex & Helpers
// ----------------------------------------------------------------------------
export const INDIAN_PHONE_REGEX = /^(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{9}$/;

/**
 * Formats a valid Indian mobile number to the standard: +91 XXXXX XXXXX
 */
export function normalizeIndianPhone(input: string): string {
  const cleaned = input.replace(/[\s\-\(\)]/g, "");
  const match = cleaned.match(/(?:(?:\+|0{0,2})91)?([6-9]\d{9})$/);
  if (match && match[1]) {
    return `+91 ${match[1].slice(0, 5)} ${match[1].slice(5)}`;
  }
  return input.trim();
}

/**
 * Validates an Indian phone number string against the national numbering scheme.
 */
export function isValidIndianPhone(input: string): boolean {
  if (!input) return false;
  const cleaned = input.replace(/[\s\-\(\)]/g, "");
  return INDIAN_PHONE_REGEX.test(cleaned);
}

// ----------------------------------------------------------------------------
// Honeypot Bot Spam Prevention
// ----------------------------------------------------------------------------
export const honeypotSchema = z
  .string()
  .max(0, "Invalid submission.")
  .optional()
  .or(z.literal(""));

/**
 * Returns true if the honeypot field contains any text (indicating a bot).
 */
export function isHoneypotTriggered(website?: string): boolean {
  return Boolean(website && website.trim().length > 0);
}

// ----------------------------------------------------------------------------
// Human-Friendly Reference Code Generator
// ----------------------------------------------------------------------------
/**
 * Generates an uppercase alphanumeric reference code like: GOD-7K2M9X or GOC-8R4W1Y
 */
export function generateReferenceCode(prefix: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${randomSuffix}`;
}

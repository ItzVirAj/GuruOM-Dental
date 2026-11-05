/**
 * Centralized Security & Authentication Policy Constants for GuruOm Dental
 * All session lifetimes, lockouts, rate limits, and password constraints live here.
 */

// Sessions
export const SESSION_IDLE_EXPIRES_IN_SECONDS = 60 * 60; // 60 minutes idle lifetime
export const SESSION_UPDATE_AGE_SECONDS = 5 * 60; // 5 minutes sliding window refresh
export const SESSION_ABSOLUTE_MAX_AGE_SECONDS = 12 * 60 * 60; // 12 hours absolute maximum lifetime
export const SESSION_FRESH_AGE_SECONDS = 10 * 60; // 10 minutes for sensitive re-authentication

// Password Requirements
export const PASSWORD_MIN_LENGTH = 14;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_MIN_ZXCVBN_SCORE = 3; // zxcvbn scale 0-4 (3 = safe / strong)

// Common / trivial passwords explicitly rejected
export const FORBIDDEN_PASSWORDS = [
  "password12345",
  "adminpassword1",
  "guruomdental123",
  "guruomadmin2026",
  "changeme123456",
  "letmein1234567",
  "welcome1234567",
] as const;

// Two-Factor Authentication (TOTP & Backup Codes)
export const TWO_FACTOR_ISSUER = "GuruOm Dental Admin";
export const TWO_FACTOR_BACKUP_CODES_COUNT = 10;
export const TWO_FACTOR_DIGITS = 6;
export const TWO_FACTOR_PERIOD_SECONDS = 30;

// Account Lockout
export const MAX_CONSECUTIVE_AUTH_FAILURES = 5;
export const INITIAL_LOCKOUT_DURATION_SECONDS = 15 * 60; // 15 minutes
export const MAX_LOCKOUT_DURATION_SECONDS = 24 * 60 * 60; // 24 hours cap

// Rate Limiting (Database-backed per IP)
export const RATE_LIMIT_SIGN_IN_MAX = 5;
export const RATE_LIMIT_SIGN_IN_WINDOW_SECONDS = 10 * 60; // 5 per 10 minutes

export const RATE_LIMIT_TWO_FACTOR_MAX = 5;
export const RATE_LIMIT_TWO_FACTOR_WINDOW_SECONDS = 10 * 60; // 5 per 10 minutes

export const RATE_LIMIT_GENERAL_AUTH_MAX = 30;
export const RATE_LIMIT_GENERAL_AUTH_WINDOW_SECONDS = 60; // 30 per minute

// Audit & Security Event Retention
export const SECURITY_EVENT_RETENTION_DAYS = 180;

export const IST_TIMEZONE = "Asia/Kolkata";
export const IST_LABEL = "IST (UTC+05:30)";

/**
 * Converts an IST date string (YYYY-MM-DD) and time string (HH:mm) into a UTC Date object.
 */
export function istInputToUtc(dateStr: string, timeStr: string): Date {
  const cleanDate = dateStr.trim();
  const cleanTime = timeStr.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD.");
  }

  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(cleanTime)) {
    throw new Error("Invalid time format. Expected HH:mm.");
  }

  const normalizedTime = cleanTime.length === 5 ? `${cleanTime}:00` : cleanTime;
  const isoWithOffset = `${cleanDate}T${normalizedTime}+05:30`;
  const date = new Date(isoWithOffset);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date/time input.");
  }

  return date;
}

/**
 * Formats a UTC date for display in IST with optional formatting options.
 */
export function formatUtcToIst(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  },
  includeLabel: boolean = true
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  const formatted = new Intl.DateTimeFormat("en-IN", {
    ...options,
    timeZone: IST_TIMEZONE,
  }).format(d);

  return includeLabel ? `${formatted} IST` : formatted;
}

/**
 * Formats relative time description (e.g., "in 3 days", "in 2 hours", "yesterday").
 */
export function formatRelativeTime(targetDate: Date | string, baseDate: Date = new Date()): string {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  if (isNaN(target.getTime())) return "";

  const diffMs = target.getTime() - baseDate.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffSecs) < 60) return "just now";
  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, "minute");
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");
  const diffMonths = Math.round(diffDays / 30);
  return rtf.format(diffMonths, "month");
}

/**
 * Validates that a scheduled publish date is at least 5 minutes in the future
 * and at most 2 years ahead.
 */
export function validateScheduleDate(
  publishAt: Date,
  now: Date = new Date()
): { valid: boolean; error?: string } {
  const minTime = now.getTime() + 5 * 60 * 1000; // 5 minutes ahead
  const maxTime = now.getTime() + 2 * 365.25 * 24 * 60 * 60 * 1000; // 2 years ahead

  const targetTime = publishAt.getTime();

  if (isNaN(targetTime)) {
    return { valid: false, error: "Invalid schedule timestamp." };
  }

  if (targetTime < minTime) {
    return {
      valid: false,
      error: "Scheduled time must be at least 5 minutes in the future.",
    };
  }

  if (targetTime > maxTime) {
    return {
      valid: false,
      error: "Scheduled time cannot be more than 2 years in the future.",
    };
  }

  return { valid: true };
}

/**
 * Formats ISO date or Date object to a standardized string (e.g. "15 Oct 2026")
 * Uses fixed locale and timezone to prevent server/client hydration mismatches.
 */
export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  try {
    const date =
      typeof dateInput === "string"
        ? new Date(dateInput.includes("T") ? dateInput : `${dateInput}T00:00:00`)
        : dateInput;

    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return String(dateInput);
  }
}

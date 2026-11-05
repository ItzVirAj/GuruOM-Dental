import { describe, it, expect } from "vitest";
import {
  istInputToUtc,
  formatUtcToIst,
  validateScheduleDate,
} from "../src/server/owner/posts/timezone";

describe("IST Timezone conversion and schedule validator", () => {
  it("converts IST date and time strings accurately to UTC", () => {
    // 2026-11-04 10:30 IST is 2026-11-04 05:00 UTC (IST is UTC+05:30)
    const utcDate = istInputToUtc("2026-11-04", "10:30");
    expect(utcDate.toISOString()).toBe("2026-11-04T05:00:00.000Z");
  });

  it("formats UTC dates into IST human-readable strings", () => {
    const utcDate = new Date("2026-11-04T05:00:00.000Z");
    const formatted = formatUtcToIst(utcDate);
    expect(formatted).toContain("IST");
    expect(formatted).toContain("10:30");
  });

  it("validates schedule dates correctly", () => {
    const now = new Date();

    // Past date fails
    const pastDate = new Date(now.getTime() - 60 * 1000);
    const pastResult = validateScheduleDate(pastDate);
    expect(pastResult.valid).toBe(false);
    expect(pastResult.error).toContain("future");

    // Less than 5 minutes in future fails
    const tooSoon = new Date(now.getTime() + 2 * 60 * 1000);
    const tooSoonResult = validateScheduleDate(tooSoon);
    expect(tooSoonResult.valid).toBe(false);
    expect(tooSoonResult.error).toContain("5 minutes");

    // More than 2 years ahead fails
    const tooFar = new Date(now.getTime() + 800 * 24 * 60 * 60 * 1000);
    const tooFarResult = validateScheduleDate(tooFar);
    expect(tooFarResult.valid).toBe(false);
    expect(tooFarResult.error).toContain("2 years");

    // Valid schedule date (e.g. 7 days ahead)
    const validDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const validResult = validateScheduleDate(validDate);
    expect(validResult.valid).toBe(true);
    expect(validResult.error).toBeUndefined();
  });
});

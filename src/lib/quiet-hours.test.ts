import { describe, expect, it } from "vitest";
import { hourInTimeZone, inQuietHours, isValidTimeZone } from "@/lib/quiet-hours";

describe("inQuietHours", () => {
  it("is off when either bound is missing", () => {
    expect(inQuietHours(null, 7, 23)).toBe(false);
    expect(inQuietHours(22, null, 23)).toBe(false);
    expect(inQuietHours(22, 22, 23)).toBe(false);
  });

  it("covers a same-day window", () => {
    expect(inQuietHours(9, 17, 12)).toBe(true);
    expect(inQuietHours(9, 17, 8)).toBe(false);
    expect(inQuietHours(9, 17, 17)).toBe(false);
  });

  it("wraps overnight", () => {
    expect(inQuietHours(22, 7, 23)).toBe(true);
    expect(inQuietHours(22, 7, 3)).toBe(true);
    expect(inQuietHours(22, 7, 12)).toBe(false);
  });
});

describe("hourInTimeZone", () => {
  it("accepts IANA zones and rejects junk", () => {
    expect(isValidTimeZone("America/Toronto")).toBe(true);
    expect(isValidTimeZone("not-a-zone")).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
  });

  it("uses the user's zone, not the server clock", () => {
    const winterNoonUtc = new Date("2026-01-15T17:00:00.000Z");
    expect(hourInTimeZone(winterNoonUtc, "America/Toronto")).toBe(12);
    expect(hourInTimeZone(winterNoonUtc, "UTC")).toBe(17);
    expect(hourInTimeZone(winterNoonUtc, "bogus")).toBe(17);
  });
});

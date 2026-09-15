import { describe, expect, it } from "vitest";
import { inQuietHours } from "@/lib/quiet-hours";

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

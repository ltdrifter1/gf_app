import { describe, expect, it } from "vitest";
import { buildPatternInsights } from "@/lib/insights";

describe("buildPatternInsights", () => {
  it("surfaces clustered glutenings", () => {
    const now = Date.now();
    const insights = buildPatternInsights({
      moods: [],
      journals: [],
      logs: [
        { kind: "glutening", severity: 3, createdAt: new Date(now - 2 * 86_400_000) },
        { kind: "glutening", severity: 4, createdAt: new Date(now - 5 * 86_400_000) },
      ],
    }, now);
    expect(insights.some((i) => i.key === "glutening-cluster-14d")).toBe(true);
  });

  it("returns nothing for empty logs", () => {
    expect(buildPatternInsights({ moods: [], logs: [], journals: [] })).toEqual([]);
  });
});

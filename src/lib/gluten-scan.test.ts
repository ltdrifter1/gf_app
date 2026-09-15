import { describe, expect, it } from "vitest";
import { analyzeIngredients, verdictLabel } from "@/lib/gluten-scan";

describe("analyzeIngredients", () => {
  it("returns unknown for empty text", () => {
    expect(analyzeIngredients("").verdict).toBe("unknown");
  });

  it("flags wheat as unsafe", () => {
    const r = analyzeIngredients("Ingredients: wheat flour, water, salt");
    expect(r.verdict).toBe("unsafe");
    expect(r.hits.some((h) => h.token === "wheat")).toBe(true);
  });

  it("treats certified GF oats as caution-cleared", () => {
    const r = analyzeIngredients("certified gluten-free oats, sugar");
    expect(r.verdict).not.toBe("unsafe");
    expect(r.hits.some((h) => h.token === "oats")).toBe(false);
  });

  it("keeps wheat even when gluten-free is claimed", () => {
    const r = analyzeIngredients("gluten-free style wheat crackers");
    expect(r.verdict).toBe("unsafe");
  });

  it("returns unknown for a tiny unlabeled fragment", () => {
    expect(analyzeIngredients("abc").verdict).toBe("unknown");
  });

  it("labels unknown verdict", () => {
    expect(verdictLabel("unknown")).toBe("Not in the catalog");
  });
});

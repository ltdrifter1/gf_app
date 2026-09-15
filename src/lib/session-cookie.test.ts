import { describe, expect, it } from "vitest";
import { pickSessionToken } from "@/lib/session-cookie";
import { BRAND } from "@/lib/brand";

describe("pickSessionToken", () => {
  it("prefers the current cookie", () => {
    const token = pickSessionToken(
      (name) => (name === BRAND.sessionCookie ? { value: "new" } : { value: "old" }),
      BRAND.sessionCookie,
      BRAND.legacySessionCookie
    );
    expect(token).toBe("new");
  });

  it("falls back to the legacy cookie", () => {
    const token = pickSessionToken(
      (name) => (name === BRAND.legacySessionCookie ? { value: "old" } : undefined),
      BRAND.sessionCookie,
      BRAND.legacySessionCookie
    );
    expect(token).toBe("old");
  });

  it("returns null when neither cookie is set", () => {
    expect(
      pickSessionToken(() => undefined, BRAND.sessionCookie, BRAND.legacySessionCookie)
    ).toBeNull();
  });
});

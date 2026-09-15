import { describe, expect, it } from "vitest";
import { isPendingDm } from "@/lib/dm";

describe("isPendingDm", () => {
  it("is pending only for DMs without an accepted timestamp", () => {
    expect(isPendingDm({ kind: "dm", dmAcceptedAt: null })).toBe(true);
    expect(isPendingDm({ kind: "dm", dmAcceptedAt: new Date() })).toBe(false);
    expect(isPendingDm({ kind: "community", dmAcceptedAt: null })).toBe(false);
  });
});

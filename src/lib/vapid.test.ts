import { describe, expect, it } from "vitest";
import { urlBase64ToUint8Array } from "@/lib/vapid";

describe("urlBase64ToUint8Array", () => {
  it("decodes URL-safe base64 without padding", () => {
    const bytes = urlBase64ToUint8Array("AQID");
    expect(Array.from(bytes)).toEqual([1, 2, 3]);
  });
});

import { describe, expect, it } from "vitest";
import { catalogImageUrl, isStaleCatalogImage, safeImageSrc } from "./safe-image";
import { followingAuthorFilter } from "./feed";
import {
  parseModuleOrder,
  sanitizeHexColor,
  sanitizeWallText,
  isThemeId,
} from "./profile-theme";

describe("safeImageSrc", () => {
  it("allows https and same-origin placeholders/uploads", () => {
    expect(safeImageSrc("https://example.com/pic.jpg")).toBe("https://example.com/pic.jpg");
    expect(safeImageSrc("/placeholders/rest-mariposa")).toBe("/placeholders/rest-mariposa");
    expect(safeImageSrc("/uploads/avatars/a.jpg")).toBe("/uploads/avatars/a.jpg");
  });

  it("rejects javascript, data, and http", () => {
    expect(safeImageSrc("javascript:alert(1)")).toBeNull();
    expect(safeImageSrc("data:image/svg+xml;base64,PHN2Zy8+")).toBeNull();
    expect(safeImageSrc("http://evil.example/x.png")).toBeNull();
    expect(safeImageSrc("/uploads/../secret")).toBeNull();
  });
});

describe("catalog images", () => {
  it("uses local placeholder paths instead of picsum", () => {
    expect(catalogImageUrl("rest-mariposa")).toBe("/placeholders/rest-mariposa");
    expect(isStaleCatalogImage("https://picsum.photos/seed/x/800/600")).toBe(true);
    expect(isStaleCatalogImage("/placeholders/rest-mariposa")).toBe(false);
  });
});

describe("followingAuthorFilter", () => {
  it("does not include the viewer and is empty with no follows", () => {
    expect(followingAuthorFilter([])).toEqual({ empty: true });
    expect(followingAuthorFilter(["a", "b"])).toEqual({
      empty: false,
      authorId: { in: ["a", "b"] },
    });
  });
});

describe("profile studio sanitizers", () => {
  it("strips tags from guestbook notes", () => {
    expect(sanitizeWallText("  hi <script>alert(1)</script> there ")).toBe("hi alert(1) there");
    expect(sanitizeWallText("a".repeat(400)).length).toBe(280);
  });

  it("only allows hex colours and known themes", () => {
    expect(sanitizeHexColor("#0d9488")).toBe("#0d9488");
    expect(sanitizeHexColor("red")).toBeNull();
    expect(isThemeId("pink-glitter")).toBe(true);
    expect(isThemeId("comic-sans-injection")).toBe(false);
  });

  it("fills missing modules in order", () => {
    expect(parseModuleOrder(["wall", "pic"])[0]).toBe("wall");
    expect(parseModuleOrder(["wall", "pic"])).toContain("friends");
  });
});

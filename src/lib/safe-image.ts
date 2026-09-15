/**
 * HTTPS-only image URLs for <img src>. Rejects javascript:, data:, and http.
 * Same-origin catalog/upload paths are allowed.
 */
const DANGEROUS = /^(javascript|data|vbscript|file|blob):/i;

export function safeImageSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 2000) return null;
  if (DANGEROUS.test(trimmed)) return null;
  if (trimmed.includes("\0") || /\s/.test(trimmed) && !trimmed.startsWith("https://")) {
    return null;
  }

  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/placeholders/")) {
    if (trimmed.includes("..") || trimmed.includes("//") || trimmed.includes("\\")) return null;
    if (!/^\/(uploads|placeholders)\/[A-Za-z0-9._~\-/%?=&]+$/.test(trimmed)) return null;
    return trimmed;
  }

  try {
    const u = new URL(trimmed);
    if (u.protocol !== "https:") return null;
    if (u.username || u.password) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function isAllowedImageUrl(url: string) {
  return safeImageSrc(url) !== null;
}

export function isStaleCatalogImage(url: string | null | undefined) {
  if (!url) return true;
  return /picsum\.photos|fastly\.picsum/i.test(url);
}

/** Same-origin SVG placeholder — never depends on a third-party CDN. */
export function catalogImageUrl(seed: string) {
  const clean = seed.replace(/[^a-z0-9_-]/gi, "").slice(0, 48) || "spot";
  return `/placeholders/${clean}`;
}

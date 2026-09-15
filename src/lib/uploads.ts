import "server-only";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 4 * 1024 * 1024;

export function uploadsConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function extFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

/** Store an image. Uses Vercel Blob when token is set; otherwise public/uploads (local). */
export async function saveImageUpload(
  file: File,
  folder: "scans" | "receipts" | "posts" | "avatars" | "dining" | "evidence"
): Promise<{ url: string } | { error: string }> {
  if (!file || file.size === 0) return { error: "Choose a photo" };
  if (file.size > MAX_BYTES) return { error: "Photo must be under 4 MB" };
  const type = file.type || "image/jpeg";
  if (!ALLOWED.has(type)) return { error: "Use a JPG, PNG, or WebP photo" };

  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extFor(type)}`;

  if (uploadsConfigured()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, buf, { access: "public", contentType: type });
    return { url: blob.url };
  }

  const fs = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(dir, { recursive: true });
  const filename = name.split("/")[1];
  await fs.writeFile(path.join(dir, filename), buf);
  return { url: `/uploads/${folder}/${filename}` };
}

export function isAllowedImageUrl(url: string) {
  if (!url) return false;
  if (url.startsWith("/uploads/")) return true;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    return (
      host.endsWith(".public.blob.vercel-storage.com") ||
      host === "picsum.photos" ||
      host.endsWith(".openfoodfacts.org") ||
      host === "images.openfoodfacts.org"
    );
  } catch {
    return false;
  }
}

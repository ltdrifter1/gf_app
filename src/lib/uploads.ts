import "server-only";
import { isAllowedImageUrl as httpsImageOk } from "@/lib/safe-image";

export { safeImageSrc, isAllowedImageUrl, catalogImageUrl, isStaleCatalogImage } from "@/lib/safe-image";

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

export type UploadFolder =
  | "scans"
  | "receipts"
  | "posts"
  | "avatars"
  | "dining"
  | "evidence"
  | "covers";

/** Store an image. Uses Vercel Blob when token is set; otherwise public/uploads (local). */
export async function saveImageUpload(
  file: File,
  folder: UploadFolder
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

/** @deprecated use isAllowedImageUrl from safe-image — kept for existing imports */
export function assertHttpsImage(url: string) {
  return httpsImageOk(url);
}

"use server";

import { requireUser } from "@/lib/auth";
import { saveImageUpload } from "@/lib/uploads";

const FOLDERS = ["scans", "receipts", "posts", "avatars", "dining", "evidence", "covers"] as const;
export type UploadFolder = (typeof FOLDERS)[number];

export async function uploadImage(formData: FormData) {
  await requireUser();
  const file = formData.get("file");
  const folderRaw = String(formData.get("folder") || "posts");
  const folder = (FOLDERS as readonly string[]).includes(folderRaw)
    ? (folderRaw as UploadFolder)
    : "posts";
  if (!(file instanceof File)) return { error: "Choose a photo" };
  return saveImageUpload(file, folder);
}

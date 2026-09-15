"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { isAllowedImageUrl } from "@/lib/uploads";

function money(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v) || v < 0 || v > 100000) return null;
  return Math.round(v * 100) / 100;
}

export async function addGfCostEntry(formData: FormData) {
  const user = await requireUser();
  const productName = String(formData.get("productName") || "").trim().slice(0, 120);
  const gfPrice = money(formData.get("gfPrice"));
  const regularPrice = money(formData.get("regularPrice"));
  const store = String(formData.get("store") || "").trim().slice(0, 80) || null;
  const dateRaw = String(formData.get("purchasedAt") || "");
  const parsedDate = dateRaw ? new Date(dateRaw) : new Date();
  const purchasedAt = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  const photoRaw = String(formData.get("photoUrl") || "").trim();
  const photoUrl = photoRaw && isAllowedImageUrl(photoRaw) ? photoRaw : "";

  if (!productName) return { error: "Add a product name" };
  if (gfPrice == null) return { error: "Add the gluten-free price" };
  if (regularPrice == null) return { error: "Add the regular (gluten) price" };
  if (Number.isNaN(purchasedAt.getTime())) return { error: "Pick a valid date" };
  if (photoUrl && !/^https?:\/\//i.test(photoUrl)) {
    return { error: "Photo must be an http(s) URL" };
  }

  const entry = await prisma.gfCostEntry.create({
    data: {
      userId: user.id,
      productName,
      gfPrice,
      regularPrice,
      store,
      purchasedAt,
      photoUrl: photoUrl || null,
    },
  });

  revalidatePath("/app/costs");
  return {
    ok: true,
    entry: {
      id: entry.id,
      productName: entry.productName,
      gfPrice: entry.gfPrice,
      regularPrice: entry.regularPrice,
      differential: Math.max(0, entry.gfPrice - entry.regularPrice),
      store: entry.store,
      purchasedAt: entry.purchasedAt.toISOString(),
      photoUrl: entry.photoUrl,
    },
  };
}

export async function deleteGfCostEntry(id: string) {
  const user = await requireUser();
  const existing = await prisma.gfCostEntry.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { error: "Entry not found" };
  await prisma.gfCostEntry.delete({ where: { id } });
  revalidatePath("/app/costs");
  return { ok: true };
}

export async function exportGfCostsCsv(year?: number) {
  const user = await requireUser();
  const y = year && year >= 2000 && year <= 2100 ? year : new Date().getFullYear();
  const start = new Date(Date.UTC(y, 0, 1));
  const end = new Date(Date.UTC(y + 1, 0, 1));
  const entries = await prisma.gfCostEntry.findMany({
    where: { userId: user.id, purchasedAt: { gte: start, lt: end } },
    orderBy: { purchasedAt: "asc" },
  });

  const header = [
    "Date",
    "Supplier / store",
    "Description",
    "Gluten-free amount paid (CAD)",
    "Comparable regular price (CAD)",
    "Differential (CAD)",
  ];
  const rows = entries.map((e) => {
    const diff = Math.max(0, e.gfPrice - e.regularPrice);
    return [
      e.purchasedAt.toISOString().slice(0, 10),
      csvCell(e.store || ""),
      csvCell(e.productName),
      e.gfPrice.toFixed(2),
      e.regularPrice.toFixed(2),
      diff.toFixed(2),
    ].join(",");
  });
  const csv = [header.join(","), ...rows].join("\n") + "\n";
  return { csv, year: y, count: entries.length };
}

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

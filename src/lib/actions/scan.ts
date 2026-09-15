"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { analyzeIngredients } from "@/lib/gluten-scan";
import { rateLimit } from "@/lib/rate-limit";
import { lookupBarcode, offTextForScan } from "@/lib/open-food-facts";

const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

async function pruneOldScans(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { keepScanHistory: true },
  });
  if (profile?.keepScanHistory) return;
  await prisma.labelScan.deleteMany({
    where: {
      userId,
      keep: false,
      createdAt: { lt: new Date(Date.now() - RETENTION_MS) },
    },
  });
}

export async function scanIngredients(input: {
  text: string;
  source?: "image" | "paste" | "barcode";
  persist?: boolean;
  barcode?: string;
}) {
  const user = await requireUser();
  const limited = await rateLimit(`scan:${user.id}`, 30, 60 * 60 * 1000);
  if (!limited.ok) {
    return { error: `Slow down — try again in ${limited.retryAfterSec}s.` };
  }

  const text = String(input.text || "").trim().slice(0, 12_000);
  if (!text) return { error: "Paste ingredients, scan a label, or look up a barcode first." };

  const result = analyzeIngredients(text);
  const source = input.source === "image" ? "image" : input.source === "barcode" ? "barcode" : "paste";

  let id: string | null = null;
  if (input.persist !== false) {
    const row = await prisma.labelScan.create({
      data: {
        userId: user.id,
        source,
        rawText: text.slice(0, 4000),
        barcode: input.barcode?.replace(/\D/g, "").slice(0, 14) || null,
        verdict: result.verdict,
        reasons: result.reasons,
      },
    });
    id = row.id;
  }

  return {
    ok: true as const,
    id,
    verdict: result.verdict,
    hits: result.hits,
    reasons: result.reasons,
    ocrText: text,
  };
}

export async function scanBarcode(barcode: string) {
  const user = await requireUser();
  const limited = await rateLimit(`scan:${user.id}`, 30, 60 * 60 * 1000);
  if (!limited.ok) {
    return { error: `Slow down — try again in ${limited.retryAfterSec}s.` };
  }

  const code = barcode.replace(/\D/g, "");
  if (code.length < 8 || code.length > 14) {
    return { error: "Enter a barcode (8–14 digits)." };
  }

  const product = await lookupBarcode(code);
  if (!product) {
    const row = await prisma.labelScan.create({
      data: {
        userId: user.id,
        source: "barcode",
        rawText: code,
        barcode: code,
        verdict: "unknown",
        reasons: ["Not in Open Food Facts (Canada or world). Try a photo or paste the ingredients."],
      },
    });
    return {
      ok: true as const,
      id: row.id,
      verdict: "unknown" as const,
      hits: [],
      reasons: [
        "Not in Open Food Facts (Canada or world). Try a photo or paste the ingredients.",
      ],
      product: null,
      ocrText: "",
    };
  }

  const text = offTextForScan(product);
  const analyzed = text.trim()
    ? analyzeIngredients(text)
    : {
        verdict: "unknown" as const,
        hits: [],
        reasons: ["Catalog hit, but no ingredient list. Treat as unknown."],
      };

  const row = await prisma.labelScan.create({
    data: {
      userId: user.id,
      source: "barcode",
      rawText: text.slice(0, 4000) || product.name,
      barcode: code,
      verdict: analyzed.verdict,
      reasons: analyzed.reasons,
    },
  });

  return {
    ok: true as const,
    id: row.id,
    verdict: analyzed.verdict,
    hits: analyzed.hits,
    reasons: analyzed.reasons,
    product,
    ocrText: text,
  };
}

export async function reportScanMiss(input: { scanId?: string; barcode?: string; rawText?: string; note?: string }) {
  const user = await requireUser();
  await prisma.scanMissReport.create({
    data: {
      userId: user.id,
      scanId: input.scanId || null,
      barcode: input.barcode?.replace(/\D/g, "").slice(0, 14) || null,
      rawText: (input.rawText || "").slice(0, 2000),
      note: (input.note || "").slice(0, 280) || null,
    },
  });
  return { ok: true as const };
}

export async function keepLabelScan(id: string) {
  const user = await requireUser();
  const existing = await prisma.labelScan.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { error: "Not found" };
  await prisma.labelScan.update({ where: { id }, data: { keep: true } });
  return { ok: true };
}

export async function getRecentScans(take = 12) {
  const user = await requireUser();
  await pruneOldScans(user.id);
  const rows = await prisma.labelScan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map((r) => ({
    id: r.id,
    source: r.source,
    verdict: r.verdict,
    barcode: r.barcode,
    reasons: Array.isArray(r.reasons) ? (r.reasons as string[]) : [],
    preview: r.rawText.slice(0, 140),
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function deleteLabelScan(id: string) {
  const user = await requireUser();
  const existing = await prisma.labelScan.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { error: "Not found" };
  await prisma.labelScan.delete({ where: { id } });
  return { ok: true };
}

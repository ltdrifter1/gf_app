"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { analyzeIngredients } from "@/lib/gluten-scan";
import { rateLimit } from "@/lib/rate-limit";

export async function scanIngredients(input: { text: string; source?: "image" | "paste"; persist?: boolean }) {
  const user = await requireUser();
  const limited = rateLimit(`scan:${user.id}`, 30, 60 * 60 * 1000);
  if (!limited.ok) {
    return { error: `Slow down — try again in ${limited.retryAfterSec}s.` };
  }

  const text = String(input.text || "").trim().slice(0, 12_000);
  if (!text) return { error: "Paste ingredients or scan a label first." };

  const result = analyzeIngredients(text);
  const source = input.source === "image" ? "image" : "paste";

  let id: string | null = null;
  if (input.persist !== false) {
    const row = await prisma.labelScan.create({
      data: {
        userId: user.id,
        source,
        rawText: text.slice(0, 4000),
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
  };
}

export async function getRecentScans(take = 12) {
  const user = await requireUser();
  const rows = await prisma.labelScan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map((r) => ({
    id: r.id,
    source: r.source,
    verdict: r.verdict,
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

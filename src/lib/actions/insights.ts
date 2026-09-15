"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { buildPatternInsights } from "@/lib/insights";

export async function setInsightsOptIn(optIn: boolean) {
  const user = await requireUser();
  await prisma.profile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, insightsOptIn: optIn, diagnosis: "unspecified" },
    update: { insightsOptIn: optIn },
  });
  revalidatePath("/app/health");
  revalidatePath("/app/journal");
  revalidatePath("/app/profile");
  return { ok: true };
}

export async function dismissInsight(key: string) {
  const user = await requireUser();
  const cleaned = key.trim().slice(0, 80);
  if (!cleaned) return { error: "Missing insight" };
  await prisma.insightDismissal.upsert({
    where: { userId_insightKey: { userId: user.id, insightKey: cleaned } },
    create: { userId: user.id, insightKey: cleaned },
    update: {},
  });
  revalidatePath("/app/health");
  revalidatePath("/app/journal");
  return { ok: true };
}

export async function getPrivateInsights() {
  const user = await requireUser();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile?.insightsOptIn) {
    return { optIn: false, insights: [] as { key: string; title: string; body: string; href?: string }[] };
  }

  const [moods, logs, journals, dismissed] = await Promise.all([
    prisma.moodEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    prisma.healthLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    prisma.journalEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: { content: true, createdAt: true },
    }),
    prisma.insightDismissal.findMany({
      where: { userId: user.id },
      select: { insightKey: true },
    }),
  ]);

  const skipped = new Set(dismissed.map((d) => d.insightKey));
  const insights = buildPatternInsights({ moods, logs, journals }).filter((i) => !skipped.has(i.key));
  return { optIn: true, insights };
}

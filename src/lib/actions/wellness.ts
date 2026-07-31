"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { MOOD_OPTIONS } from "@/lib/constants";

export async function logMood(formData: FormData) {
  const user = await requireUser();
  const mood = Number(formData.get("mood") || 3);
  const note = String(formData.get("note") || "").trim() || null;
  await prisma.moodEntry.create({ data: { userId: user.id, mood, note } });

  // Mirror check-in onto MySpace profile mood so the public page stays alive
  const opt = MOOD_OPTIONS.find((o) => o.value === mood);
  const profileMood = note
    ? `${opt?.emoji ?? ""} ${note}`.trim().slice(0, 80)
    : `${opt?.emoji ?? ""} ${opt?.label ?? "Okay"}`.trim().slice(0, 80);

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, mood: profileMood },
    update: { mood: profileMood },
  });

  revalidatePath("/app/health");
  revalidatePath("/app/profile");
  revalidatePath(`/app/u/${user.username}`);
  return { ok: true };
}

export async function addJournal(formData: FormData) {
  const user = await requireUser();
  const content = String(formData.get("content") || "").trim();
  const prompt = String(formData.get("prompt") || "").trim() || null;
  if (!content) return { error: "Write something first" };
  await prisma.journalEntry.create({ data: { userId: user.id, content, prompt } });
  revalidatePath("/app/health");
  return { ok: true };
}

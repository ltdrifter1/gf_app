"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function logMood(formData: FormData) {
  const user = await requireUser();
  const mood = Number(formData.get("mood") || 3);
  const note = String(formData.get("note") || "").trim() || null;
  await prisma.moodEntry.create({ data: { userId: user.id, mood, note } });
  revalidatePath("/app/mental-health");
  return { ok: true };
}

export async function addJournal(formData: FormData) {
  const user = await requireUser();
  const content = String(formData.get("content") || "").trim();
  const prompt = String(formData.get("prompt") || "").trim() || null;
  if (!content) return { error: "Write something first" };
  await prisma.journalEntry.create({ data: { userId: user.id, content, prompt } });
  revalidatePath("/app/mental-health");
  return { ok: true };
}

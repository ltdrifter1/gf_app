"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { MOOD_OPTIONS } from "@/lib/constants";

const HEALTH_LOG_KINDS = new Set(["glutening", "symptom", "flare"]);

function revalidateHealth() {
  revalidatePath("/app/health");
}

export async function logMood(formData: FormData) {
  const user = await requireUser();
  const mood = Number(formData.get("mood") || 0);
  if (!Number.isInteger(mood) || mood < 1 || mood > 5) {
    return { error: "Pick how you're feeling" };
  }
  const note = String(formData.get("note") || "").trim().slice(0, 120) || null;
  const shareToProfile = formData.get("shareToProfile") === "on" || formData.get("shareToProfile") === "true";

  const entry = await prisma.moodEntry.create({
    data: { userId: user.id, mood, note, shareToProfile },
  });

  if (shareToProfile) {
    const opt = MOOD_OPTIONS.find((o) => o.value === mood);
    const profileMood = note
      ? `${opt?.emoji ?? ""} ${note}`.trim().slice(0, 80)
      : `${opt?.emoji ?? ""} ${opt?.label ?? "Okay"}`.trim().slice(0, 80);

    await prisma.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, mood: profileMood },
      update: { mood: profileMood },
    });
    revalidatePath("/app/profile");
    revalidatePath(`/app/u/${user.username}`);
  }

  revalidateHealth();
  return {
    ok: true,
    entry: {
      id: entry.id,
      mood: entry.mood,
      note: entry.note,
      shareToProfile: entry.shareToProfile,
      createdAt: entry.createdAt.toISOString(),
    },
  };
}

export async function addJournal(formData: FormData) {
  const user = await requireUser();
  const content = String(formData.get("content") || "").trim();
  const prompt = String(formData.get("prompt") || "").trim() || null;
  const moodRaw = formData.get("mood");
  const moodNum = moodRaw != null && String(moodRaw) !== "" ? Number(moodRaw) : null;
  const mood =
    moodNum != null && Number.isInteger(moodNum) && moodNum >= 1 && moodNum <= 5 ? moodNum : null;

  if (!content) return { error: "Write something first" };
  if (content.length > 8000) return { error: "Keep entries under 8,000 characters" };

  const entry = await prisma.journalEntry.create({
    data: { userId: user.id, content, prompt, mood },
  });

  revalidateHealth();
  return {
    ok: true,
    entry: {
      id: entry.id,
      prompt: entry.prompt,
      content: entry.content,
      mood: entry.mood,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    },
  };
}

export async function updateJournal(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const content = String(formData.get("content") || "").trim();
  const prompt = String(formData.get("prompt") || "").trim() || null;
  const moodRaw = formData.get("mood");
  const moodNum = moodRaw != null && String(moodRaw) !== "" ? Number(moodRaw) : null;
  const mood =
    moodNum != null && Number.isInteger(moodNum) && moodNum >= 1 && moodNum <= 5 ? moodNum : null;
  const clearMood = formData.get("clearMood") === "true";

  if (!id) return { error: "Missing entry" };
  if (!content) return { error: "Write something first" };
  if (content.length > 8000) return { error: "Keep entries under 8,000 characters" };

  const existing = await prisma.journalEntry.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { error: "Entry not found" };

  const entry = await prisma.journalEntry.update({
    where: { id },
    data: {
      content,
      prompt,
      ...(clearMood ? { mood: null } : mood != null ? { mood } : {}),
    },
  });

  revalidateHealth();
  return {
    ok: true,
    entry: {
      id: entry.id,
      prompt: entry.prompt,
      content: entry.content,
      mood: entry.mood,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    },
  };
}

export async function deleteJournal(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing entry" };

  const existing = await prisma.journalEntry.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { error: "Entry not found" };

  await prisma.journalEntry.delete({ where: { id } });
  revalidateHealth();
  return { ok: true };
}

export async function addHealthLog(formData: FormData) {
  const user = await requireUser();
  const kind = String(formData.get("kind") || "").trim();
  const severity = Number(formData.get("severity") || 0);
  const note = String(formData.get("note") || "").trim().slice(0, 280) || null;

  if (!HEALTH_LOG_KINDS.has(kind)) return { error: "Pick a log type" };
  if (!Number.isInteger(severity) || severity < 1 || severity > 5) {
    return { error: "Pick severity 1–5" };
  }

  const entry = await prisma.healthLog.create({
    data: { userId: user.id, kind, severity, note },
  });

  // Companion loop: after a rough glutening/flare, nudge toward support + recovery
  if (kind === "glutening" || (kind === "flare" && severity >= 4)) {
    const tip =
      kind === "glutening"
        ? "Rest, hydrate, and be kinder to yourself than the internet would. Recovery tips + a gentle room are ready when you are."
        : "Rough flares deserve soft landings — recovery tips or company in Messenger, your call.";
    await prisma.notification
      .create({
        data: {
          userId: user.id,
          type: "companion",
          title: kind === "glutening" ? "Hey — you’re not alone after a glutening" : "Flare care, whenever you’re ready",
          body: tip,
          href: "/app/health/r/after-glutening",
        },
      })
      .catch(() => {});
  }

  revalidateHealth();
  return {
    ok: true,
    entry: {
      id: entry.id,
      kind: entry.kind,
      severity: entry.severity,
      note: entry.note,
      createdAt: entry.createdAt.toISOString(),
    },
    companion:
      kind === "glutening" || (kind === "flare" && severity >= 4)
        ? {
            href: "/app/chat/mental-health",
            tipHref: "/app/health/r/after-glutening",
            message:
              kind === "glutening"
                ? "Want company? The Mental Health room gets it — or peek at recovery tips first."
                : "Mental Health room or recovery tips — whichever feels lighter right now.",
          }
        : null,
  };
}

export async function deleteHealthLog(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing entry" };

  const existing = await prisma.healthLog.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { error: "Entry not found" };

  await prisma.healthLog.delete({ where: { id } });
  revalidateHealth();
  return { ok: true };
}

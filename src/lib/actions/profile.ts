"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { JOURNEY_STAGES } from "@/lib/constants";
import { isPresenceSlug, type PresenceSlug } from "@/lib/presence";
import { isAllowedImageUrl } from "@/lib/uploads";
import { maybeNudgePanicBuddy } from "@/lib/checkin-nudge";
import { isValidTimeZone } from "@/lib/quiet-hours";

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const diagnosis = String(formData.get("diagnosis") || "unspecified").trim();
  const journeyRaw = String(formData.get("journeyStage") || "").trim();
  const journeyStage = JOURNEY_STAGES.some((s) => s.slug === journeyRaw)
    ? journeyRaw
    : "newly-diagnosed";
  const insightsOptIn =
    formData.get("insightsOptIn") === "on" || formData.get("insightsOptIn") === "true";
  const avatarRaw = String(formData.get("avatarUrl") || "").trim();
  if (avatarRaw && !isAllowedImageUrl(avatarRaw)) {
    return { error: "Use an uploaded photo or an allowed image URL" };
  }
  const avatarUrl = avatarRaw || null;
  const mood = String(formData.get("mood") || "").trim().slice(0, 80);
  const likeToMeet = String(formData.get("likeToMeet") || "").trim().slice(0, 500);
  const interests = String(formData.get("interests") || "").trim().slice(0, 500);

  if (name.length < 2) return { error: "Name must be at least 2 characters" };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      bio: bio || null,
      location: location || null,
      avatarUrl,
      profile: {
        upsert: {
          create: {
            diagnosis,
            journeyStage,
            mood: mood || null,
            likeToMeet: likeToMeet || null,
            interests: interests || null,
            insightsOptIn,
          },
          update: {
            diagnosis,
            journeyStage,
            mood: mood || null,
            likeToMeet: likeToMeet || null,
            interests: interests || null,
            insightsOptIn,
          },
        },
      },
    },
  });

  revalidatePath("/app/profile");
  revalidatePath(`/app/u/${user.username}`);
  revalidatePath("/app/health");
  revalidatePath("/app/journal");
  revalidatePath("/app");
  return { ok: true };
}

export async function setPresence(presence: PresenceSlug | "online" | "away" | "offline") {
  const user = await requireUser();
  const next: PresenceSlug = isPresenceSlug(presence) ? presence : "online";
  await prisma.user.update({
    where: { id: user.id },
    data: { presence: next, lastSeen: new Date() },
  });
  await maybeNudgePanicBuddy(user.id, next);
  revalidatePath("/app/profile");
  revalidatePath("/app/chat");
  return { ok: true };
}

/** Quick status/mood line for the Messenger "You" strip. */
export async function updateStatusMessage(mood: string) {
  const user = await requireUser();
  const cleaned = mood.trim().slice(0, 80);
  await prisma.profile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, diagnosis: "unspecified", mood: cleaned || null },
    update: { mood: cleaned || null },
  });
  revalidatePath("/app/chat");
  revalidatePath("/app/profile");
  revalidatePath(`/app/u/${user.username}`);
  return { ok: true };
}

/** Top 8 friends = people you follow (newest first), classic MySpace Friend Space. */
export async function getTopFriends(userId: string, take = 8) {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      following: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          presence: true,
          lastSeen: true,
        },
      },
    },
  });
  return follows.map((f) => f.following);
}

export async function updateNotificationPrefs(formData: FormData) {
  const user = await requireUser();
  const hour = (key: string) => {
    const raw = String(formData.get(key) || "").trim();
    if (raw === "") return null;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0 || n > 23) return null;
    return n;
  };
  const start = hour("quietHoursStart");
  const end = hour("quietHoursEnd");
  if ((start == null) !== (end == null)) {
    return { error: "Set both quiet-hour times, or leave both off." };
  }
  const tzRaw = String(formData.get("timezone") || "").trim();
  const timezone = isValidTimeZone(tzRaw) ? tzRaw : undefined;

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      diagnosis: "unspecified",
      notifyDms: formData.get("notifyDms") === "on",
      notifyBuddy: formData.get("notifyBuddy") === "on",
      notifyCheckin: formData.get("notifyCheckin") === "on",
      notifyDining: formData.get("notifyDining") === "on",
      keepScanHistory: formData.get("keepScanHistory") === "on",
      quietHoursStart: start,
      quietHoursEnd: end,
      ...(timezone ? { timezone } : {}),
    },
    update: {
      notifyDms: formData.get("notifyDms") === "on",
      notifyBuddy: formData.get("notifyBuddy") === "on",
      notifyCheckin: formData.get("notifyCheckin") === "on",
      notifyDining: formData.get("notifyDining") === "on",
      keepScanHistory: formData.get("keepScanHistory") === "on",
      quietHoursStart: start,
      quietHoursEnd: end,
      ...(timezone ? { timezone } : {}),
    },
  });
  revalidatePath("/app/profile");
  return { ok: true };
}

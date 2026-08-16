"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { JOURNEY_STAGES } from "@/lib/constants";

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
  const avatarUrl = String(formData.get("avatarUrl") || "").trim() || null;
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
          },
          update: {
            diagnosis,
            journeyStage,
            mood: mood || null,
            likeToMeet: likeToMeet || null,
            interests: interests || null,
          },
        },
      },
    },
  });

  revalidatePath("/app/profile");
  revalidatePath(`/app/u/${user.username}`);
  revalidatePath("/app/health");
  revalidatePath("/app");
  return { ok: true };
}

export async function setPresence(presence: "online" | "away" | "offline") {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { presence, lastSeen: new Date() },
  });
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

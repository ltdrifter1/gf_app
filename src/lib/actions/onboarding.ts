"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  COMPANION_GOALS,
  parseGoals,
  primaryRoomForGoals,
  type CompanionGoalSlug,
} from "@/lib/companion";
import { JOURNEY_STAGES } from "@/lib/constants";
import { createNotification } from "@/lib/actions/notifications";

export async function completeOnboarding(formData: FormData) {
  const user = await requireUser();

  const diagnosis = String(formData.get("diagnosis") || "unspecified").trim();
  const journeyRaw = String(formData.get("journeyStage") || "").trim();
  const journeyStage = JOURNEY_STAGES.some((s) => s.slug === journeyRaw)
    ? journeyRaw
    : "newly-diagnosed";
  const location = String(formData.get("location") || "").trim().slice(0, 80);
  const goalsRaw = formData.getAll("goals").map(String);
  const allowed = new Set(COMPANION_GOALS.map((g) => g.slug));
  const goals = goalsRaw.filter((g): g is CompanionGoalSlug => allowed.has(g as CompanionGoalSlug));

  if (!location) {
    return { error: "Add your city so we can surface nearby safe dining" };
  }
  if (goals.length === 0) {
    return { error: "Pick at least one thing you're here for" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      location,
      onboardingComplete: true,
      bio: user.bio === "New to Safely" || user.bio === "New here — still unpacking the snack aisle."
        ? "Just joined — say hi in Messenger"
        : user.bio,
      profile: {
        upsert: {
          create: {
            diagnosis,
            journeyStage,
            goals: goals.join(","),
          },
          update: {
            diagnosis,
            journeyStage,
            goals: goals.join(","),
          },
        },
      },
    },
  });

  // Prefer matching community room membership (already auto-joined at register)
  const roomSlug = primaryRoomForGoals(goals);
  const room = await prisma.chatRoom.findUnique({ where: { slug: roomSlug } });
  if (room) {
    await prisma.chatRoomMember.upsert({
      where: { roomId_userId: { roomId: room.id, userId: user.id } },
      create: { roomId: room.id, userId: user.id },
      update: {},
    });
  }

  // Soft-match: follow up to 3 people with same diagnosis or city
  const city = location.split(",")[0]?.trim();
  const candidates = await prisma.user.findMany({
    where: {
      id: { not: user.id },
      OR: [
        { location: { contains: city, mode: "insensitive" } },
        { profile: { diagnosis } },
      ],
    },
    select: { id: true },
    take: 8,
    orderBy: { lastSeen: "desc" },
  });

  for (const c of candidates.slice(0, 3)) {
    await prisma.follow
      .upsert({
        where: {
          followerId_followingId: { followerId: user.id, followingId: c.id },
        },
        create: { followerId: user.id, followingId: c.id },
        update: {},
      })
      .catch(() => {});
  }

  await createNotification({
    userId: user.id,
    type: "companion",
    title: "You’re in",
    body: `We matched you to ${room?.name ?? "community"} and a few people nearby. Go say hi when you’re ready.`,
    href: `/app/chat/${roomSlug}`,
  }).catch(() => {});

  revalidatePath("/app");
  redirect(`/app/onboarding/ready?room=${encodeURIComponent(roomSlug)}`);
}

export async function skipOnboarding() {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingComplete: true },
  });
  redirect("/app/chat/general-support");
}

export async function getCompanionMatch(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) return null;

  const goals = parseGoals(user.profile?.goals);
  const roomSlug = primaryRoomForGoals(goals);
  const city = user.location?.split(",")[0]?.trim() || null;

  const [room, people, restaurants] = await Promise.all([
    prisma.chatRoom.findUnique({ where: { slug: roomSlug } }),
    prisma.user.findMany({
      where: {
        id: { not: userId },
        ...(city
          ? { location: { contains: city, mode: "insensitive" } }
          : user.profile?.diagnosis
            ? { profile: { diagnosis: user.profile.diagnosis } }
            : {}),
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        presence: true,
        bio: true,
        location: true,
        profile: { select: { diagnosis: true, mood: true } },
      },
      take: 6,
      orderBy: { lastSeen: "desc" },
    }),
    city
      ? prisma.restaurant.findMany({
          where: { city: { equals: city, mode: "insensitive" }, status: "published" },
          orderBy: { communityConfidence: "desc" },
          take: 5,
        })
      : prisma.restaurant.findMany({
          where: { status: "published" },
          orderBy: { communityConfidence: "desc" },
          take: 5,
        }),
  ]);

  return { user, goals, room, people, restaurants, roomSlug, city };
}

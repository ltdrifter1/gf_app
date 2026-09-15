"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { cityFromLocation } from "@/lib/companion";
import { createNotification } from "@/lib/actions/notifications";
import { getOrCreateDmRoom } from "@/lib/actions/chat";
import { BRAND } from "@/lib/brand";

const MATCH_LIMIT_PER_DAY = 5;

function pairIds(a: string, b: string) {
  return a < b ? ([a, b] as const) : ([b, a] as const);
}

function icebreaker(reason: string, city: string | null) {
  if (reason === "mentoring") {
    return `Hey — ${BRAND.name} paired you as buddies (newer + more miles). Share whatever feels useful; skip the rest. No pressure.`;
  }
  if (reason === "caregiver") {
    return `Hi — ${BRAND.name} paired you as caregiver buddies. Lunchbox diplomacy and pep talks both count. Say hello whenever.`;
  }
  if (reason === "same-city" && city) {
    return `Hey — you're both around ${city}. ${BRAND.name} thought a buddy hello might be nice. Favourite safe snack?`;
  }
  return `Hey — ${BRAND.name} thought you two might get along as buddies. A wave is plenty. No medical homework.`;
}

function scoreCandidate(opts: {
  myStage: string;
  theirStage: string | null;
  sameCity: boolean;
}): { score: number; reason: string } | null {
  const { myStage, theirStage, sameCity } = opts;
  const stage = theirStage || "intermediate";

  if (myStage === "newly-diagnosed" && stage === "experienced") {
    return { score: 50 + (sameCity ? 30 : 0), reason: "mentoring" };
  }
  if (myStage === "experienced" && stage === "newly-diagnosed") {
    return { score: 50 + (sameCity ? 30 : 0), reason: "mentoring" };
  }
  if (myStage === "caregiver" && stage === "caregiver") {
    return { score: 45 + (sameCity ? 30 : 0), reason: "caregiver" };
  }
  if (myStage === stage) {
    return { score: 20 + (sameCity ? 30 : 0), reason: sameCity ? "same-city" : "similar-stage" };
  }
  if (sameCity) {
    return { score: 25, reason: "same-city" };
  }
  if (
    (myStage === "newly-diagnosed" && stage === "intermediate") ||
    (myStage === "intermediate" && stage === "newly-diagnosed") ||
    (myStage === "intermediate" && stage === "experienced")
  ) {
    return { score: 18, reason: "similar-stage" };
  }
  return null;
}

export async function findBuddyMatch() {
  const user = await requireUser();
  const limited = rateLimit(`buddy:${user.id}`, MATCH_LIMIT_PER_DAY, 24 * 60 * 60 * 1000);
  if (!limited.ok) {
    return { error: `Easy on matches — try again in ${limited.retryAfterSec}s.` };
  }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await prisma.buddyMatch.count({
    where: {
      createdAt: { gte: dayAgo },
      OR: [{ userAId: user.id }, { userBId: user.id }],
    },
  });
  if (recent >= MATCH_LIMIT_PER_DAY) {
    return { error: "That's enough buddy matches for today. Say hi to someone you already have, or try a room." };
  }

  const me = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true },
  });
  if (!me) return { error: "Couldn't load your profile" };

  const myStage = me.profile?.journeyStage || "newly-diagnosed";
  const myCity = cityFromLocation(me.location);

  const already = await prisma.buddyMatch.findMany({
    where: { OR: [{ userAId: me.id }, { userBId: me.id }] },
    select: { userAId: true, userBId: true },
  });
  const taken = new Set<string>();
  for (const m of already) {
    taken.add(m.userAId === me.id ? m.userBId : m.userAId);
  }

  const candidates = await prisma.user.findMany({
    where: {
      id: { not: me.id, notIn: [...taken] },
      role: { not: "ADMIN" },
      profile: { isNot: null },
    },
    select: {
      id: true,
      name: true,
      location: true,
      lastSeen: true,
      profile: { select: { journeyStage: true } },
    },
    take: 80,
    orderBy: { lastSeen: "desc" },
  });

  const ranked = candidates
    .map((c) => {
      const sameCity = Boolean(
        myCity && cityFromLocation(c.location)?.toLowerCase() === myCity.toLowerCase()
      );
      const scored = scoreCandidate({
        myStage,
        theirStage: c.profile?.journeyStage ?? null,
        sameCity,
      });
      if (!scored) return null;
      return { ...c, ...scored, sameCity };
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score || b!.lastSeen.getTime() - a!.lastSeen.getTime()) as {
    id: string;
    name: string;
    location: string | null;
    lastSeen: Date;
    profile: { journeyStage: string | null } | null;
    score: number;
    reason: string;
    sameCity: boolean;
  }[];

  const pick = ranked[0];
  if (!pick) {
    return {
      error:
        "Nobody's a great fit right now. Try a community room, or add your city and journey stage on your profile.",
    };
  }

  const dm = await getOrCreateDmRoom(pick.id);
  if ("error" in dm) return { error: dm.error };

  const [a, b] = pairIds(me.id, pick.id);
  await prisma.buddyMatch.upsert({
    where: { userAId_userBId: { userAId: a, userBId: b } },
    create: { userAId: a, userBId: b, roomId: dm.id, reason: pick.reason },
    update: { reason: pick.reason, roomId: dm.id },
  });

  const city = pick.sameCity ? myCity : null;
  const content = icebreaker(pick.reason, city);

  const alreadyIced = await prisma.message.findFirst({
    where: { roomId: dm.id, content },
  });
  if (!alreadyIced) {
    await prisma.message.create({
      data: { roomId: dm.id, senderId: me.id, content },
    });
  }

  await Promise.all([
    createNotification({
      userId: me.id,
      type: "companion",
      title: "Buddy match",
      body: `You're paired with ${pick.name}. Icebreaker is in your DM — no medical details shared.`,
      href: `/app/chat/${dm.slug}`,
    }),
    createNotification({
      userId: pick.id,
      type: "companion",
      title: "A buddy said hi",
      body: `${me.name} was matched with you as a ${BRAND.name} buddy. Open the DM when you're ready — no pressure.`,
      href: `/app/chat/${dm.slug}`,
    }),
  ]).catch(() => {});

  return { ok: true as const, slug: dm.slug, name: pick.name, reason: pick.reason };
}

import "server-only";

import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notify";

const NUDGE_COOLDOWN_MS = 30 * 60 * 1000;

/** If presence is need-check-in, ping the panic buddy at most once per cooldown. */
export async function maybeNudgePanicBuddy(userId: string, presence: string) {
  if (presence !== "need-check-in") return;

  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      profile: { select: { panicBuddyId: true, lastCheckinNudgeAt: true, notifyCheckin: true } },
    },
  });
  const buddyId = me?.profile?.panicBuddyId;
  if (!buddyId || !me) return;

  const last = me.profile?.lastCheckinNudgeAt;
  if (last && Date.now() - last.getTime() < NUDGE_COOLDOWN_MS) return;

  await prisma.profile.update({
    where: { userId },
    data: { lastCheckinNudgeAt: new Date() },
  });

  await notifyUser({
    userId: buddyId,
    type: "checkin",
    title: `${me.name} could use a hello`,
    body: "They set Need a check-in. No details were shared — just a wave when you can.",
    href: "/app/chat",
    fromUserId: userId,
  }).catch(() => {});
}

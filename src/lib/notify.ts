import "server-only";

import { prisma } from "@/lib/prisma";
import { webPushConfigured } from "@/lib/push";
import { BRAND } from "@/lib/brand";
import { inQuietHours } from "@/lib/quiet-hours";

export { inQuietHours };

export async function notifyUser(opts: {
  userId: string;
  type: "message" | "companion" | "system" | "dining" | "checkin";
  title: string;
  body: string;
  href?: string | null;
  fromUserId?: string;
}) {
  if (opts.fromUserId) {
    const muted = await prisma.userMute.findUnique({
      where: { muterId_mutedId: { muterId: opts.userId, mutedId: opts.fromUserId } },
      select: { id: true },
    });
    if (muted) return;
    const blocked = await prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: opts.userId, blockedId: opts.fromUserId },
          { blockerId: opts.fromUserId, blockedId: opts.userId },
        ],
      },
      select: { id: true },
    });
    if (blocked) return;
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: opts.userId },
    select: {
      notifyDms: true,
      notifyBuddy: true,
      notifyCheckin: true,
      notifyDining: true,
      quietHoursStart: true,
      quietHoursEnd: true,
    },
  });

  const typeOk =
    opts.type === "system" ||
    (opts.type === "message" && profile?.notifyDms !== false) ||
    (opts.type === "companion" && profile?.notifyBuddy !== false) ||
    (opts.type === "checkin" && profile?.notifyCheckin !== false) ||
    (opts.type === "dining" && profile?.notifyDining !== false);

  if (!typeOk) return;

  const hour = new Date().getHours();
  const quiet = inQuietHours(profile?.quietHoursStart, profile?.quietHoursEnd, hour);

  await prisma.notification.create({
    data: {
      userId: opts.userId,
      type: opts.type === "checkin" ? "companion" : opts.type,
      title: opts.title.slice(0, 120),
      body: opts.body.slice(0, 280),
      href: opts.href ?? null,
    },
  });

  if (quiet || !webPushConfigured()) return;

  const subs = await prisma.pushSubscription.findMany({ where: { userId: opts.userId } });
  if (!subs.length) return;

  try {
    const webpush = await import("web-push");
    const pub = process.env.VAPID_PUBLIC_KEY!.trim();
    const priv = process.env.VAPID_PRIVATE_KEY!.trim();
    webpush.setVapidDetails(`mailto:hello@${BRAND.domain}`, pub, priv);
    const payload = JSON.stringify({
      title: opts.title,
      body: opts.body,
      href: opts.href || "/app/chat",
    });
    for (const s of subs) {
      await webpush
        .sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        )
        .catch(async (err: { statusCode?: number }) => {
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
          }
        });
    }
  } catch {
    /* VAPID send is best-effort */
  }
}

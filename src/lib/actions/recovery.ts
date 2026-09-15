"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { CHECKIN_CONTENT } from "@/lib/msn";
import { rateLimit } from "@/lib/rate-limit";
import { notifyUser } from "@/lib/notify";
import { getOrCreateDmRoom } from "@/lib/actions/chat";
import { addHealthLog } from "@/lib/actions/wellness";

export async function setPanicBuddy(buddyUserId: string | null) {
  const user = await requireUser();
  if (buddyUserId === user.id) return { error: "Pick someone else" };
  if (buddyUserId) {
    const exists = await prisma.user.findUnique({ where: { id: buddyUserId }, select: { id: true } });
    if (!exists) return { error: "Buddy not found" };
  }
  await prisma.profile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, panicBuddyId: buddyUserId, diagnosis: "unspecified" },
    update: { panicBuddyId: buddyUserId },
  });
  revalidatePath("/app/health");
  revalidatePath("/app/chat");
  return { ok: true };
}

export async function logGluteningRecovery(formData: FormData) {
  const user = await requireUser();
  const limited = await rateLimit(`recovery:${user.id}`, 8, 60 * 60 * 1000);
  if (!limited.ok) {
    return { error: `Give it a beat — try again in ${limited.retryAfterSec}s.` };
  }

  const shouldLog = formData.get("log") === "on" || formData.get("log") === "true";
  const shouldNudge = formData.get("nudge") === "on" || formData.get("nudge") === "true";
  const severity = Number(formData.get("severity") || 3);
  const note = String(formData.get("note") || "").trim().slice(0, 280);

  let logId: string | null = null;
  if (shouldLog) {
    const fd = new FormData();
    fd.set("kind", "glutening");
    fd.set("severity", String(Number.isInteger(severity) && severity >= 1 && severity <= 5 ? severity : 3));
    if (note) fd.set("note", note);
    const logged = await addHealthLog(fd);
    if (logged?.error) return { error: logged.error };
    logId = logged.entry?.id ?? null;
  }

  if (shouldNudge) {
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    const buddyId = profile?.panicBuddyId;
    if (!buddyId) {
      return { error: "Choose a check-in buddy first (Health → Recovery).", logId };
    }
    const dm = await getOrCreateDmRoom(buddyId, { accept: true });
    if ("error" in dm) return { error: dm.error, logId };

    await prisma.message.create({
      data: { roomId: dm.id, senderId: user.id, content: CHECKIN_CONTENT },
    });
    await notifyUser({
      userId: buddyId,
      type: "checkin",
      title: `${user.name} could use a hello`,
      body: "They used Lumen's check-in button. No details were shared — just a wave when you can.",
      href: `/app/chat/${dm.slug}`,
      fromUserId: user.id,
    }).catch(() => {});

    return { ok: true, logId, nudged: true, slug: dm.slug };
  }

  return { ok: true, logId, nudged: false };
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body: string;
  href?: string | null;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title.slice(0, 120),
      body: input.body.slice(0, 280),
      href: input.href ?? null,
    },
  });
}

export async function getNotifications(limit = 20) {
  const user = await requireUser();
  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  const unread = await prisma.notification.count({
    where: { userId: user.id, readAt: null },
  });
  return {
    unread,
    items: items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      href: n.href,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    })),
  };
}

export async function markNotificationsRead(ids?: string[]) {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      readAt: null,
      ...(ids?.length ? { id: { in: ids } } : {}),
    },
    data: { readAt: new Date() },
  });
  revalidatePath("/app");
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { isBlockedEitherWay } from "@/lib/blocks";

async function revalidateSocialSurfaces(targetUserId: string) {
  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { username: true },
  });
  revalidatePath("/app");
  revalidatePath("/app/chat");
  revalidatePath("/app/search");
  revalidatePath("/app/saved");
  revalidatePath("/app/health");
  revalidatePath("/app/profile");
  if (target?.username) revalidatePath(`/app/u/${target.username}`);
}

export async function blockUser(targetUserId: string) {
  const user = await requireUser();
  if (user.id === targetUserId) return { error: "Can't block yourself" };
  await prisma.userBlock.upsert({
    where: { blockerId_blockedId: { blockerId: user.id, blockedId: targetUserId } },
    create: { blockerId: user.id, blockedId: targetUserId },
    update: {},
  });
  await revalidateSocialSurfaces(targetUserId);
  return { ok: true };
}

export async function unblockUser(targetUserId: string) {
  const user = await requireUser();
  await prisma.userBlock.deleteMany({ where: { blockerId: user.id, blockedId: targetUserId } });
  await revalidateSocialSurfaces(targetUserId);
  return { ok: true };
}

export async function muteUser(targetUserId: string) {
  const user = await requireUser();
  if (user.id === targetUserId) return { error: "Can't mute yourself" };
  await prisma.userMute.upsert({
    where: { muterId_mutedId: { muterId: user.id, mutedId: targetUserId } },
    create: { muterId: user.id, mutedId: targetUserId },
    update: {},
  });
  await revalidateSocialSurfaces(targetUserId);
  return { ok: true };
}

export async function unmuteUser(targetUserId: string) {
  const user = await requireUser();
  await prisma.userMute.deleteMany({ where: { muterId: user.id, mutedId: targetUserId } });
  await revalidateSocialSurfaces(targetUserId);
  return { ok: true };
}

export async function acceptDmRequest(roomId: string) {
  const user = await requireUser();
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: { members: true },
  });
  if (!room || room.kind !== "dm") return { error: "Not a request" };
  if (!room.members.some((m) => m.userId === user.id)) return { error: "Not your request" };
  await prisma.chatRoom.update({ where: { id: roomId }, data: { dmAcceptedAt: new Date() } });
  revalidatePath("/app/chat");
  revalidatePath(`/app/chat/${room.slug}`);
  return { ok: true, slug: room.slug };
}

export async function declineDmRequest(roomId: string) {
  const user = await requireUser();
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: { members: true },
  });
  if (!room || room.kind !== "dm") return { error: "Not a request" };
  if (!room.members.some((m) => m.userId === user.id)) return { error: "Not your request" };
  await prisma.chatRoom.delete({ where: { id: roomId } });
  revalidatePath("/app/chat");
  return { ok: true };
}

export async function canMessage(fromId: string, toId: string) {
  if (await isBlockedEitherWay(fromId, toId)) return false;
  return true;
}

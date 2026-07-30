"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/** Stable DM slug for two users (order-independent). */
function dmSlug(a: string, b: string) {
  return `dm-${[a, b].sort().join("-")}`;
}

export async function getOrCreateDm(targetUserId: string) {
  const user = await requireUser();
  if (user.id === targetUserId) return { error: "Can't message yourself" };

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) return { error: "User not found" };

  const slug = dmSlug(user.id, targetUserId);
  let room = await prisma.chatRoom.findUnique({ where: { slug } });

  if (!room) {
    room = await prisma.chatRoom.create({
      data: {
        name: target.name,
        slug,
        description: `Chat with ${target.name}`,
        isCommunity: false,
        members: {
          create: [{ userId: user.id }, { userId: targetUserId }],
        },
      },
    });
  } else {
    await prisma.chatRoomMember.upsert({
      where: { roomId_userId: { roomId: room.id, userId: user.id } },
      create: { roomId: room.id, userId: user.id },
      update: {},
    });
  }

  redirect(`/app/chat/${room.slug}`);
}

export async function getOnlineBuddies(excludeUserId?: string) {
  const since = new Date(Date.now() - 60_000);
  return prisma.user.findMany({
    where: {
      presence: "online",
      lastSeen: { gte: since },
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      presence: true,
      bio: true,
    },
    orderBy: { name: "asc" },
    take: 40,
  });
}

export async function getDirectMessageRooms(userId: string) {
  const memberships = await prisma.chatRoomMember.findMany({
    where: { userId, room: { isCommunity: false } },
    include: {
      room: {
        include: {
          members: {
            where: { userId: { not: userId } },
            include: {
              user: {
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
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { sender: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const since = new Date(Date.now() - 60_000);
  return memberships
    .map((m) => {
      const peer = m.room.members[0]?.user;
      if (!peer) return null;
      const last = m.room.messages[0];
      const online =
        peer.presence === "online" && peer.lastSeen >= since;
      return {
        id: m.room.id,
        slug: m.room.slug,
        name: peer.name,
        username: peer.username,
        avatarUrl: peer.avatarUrl,
        presence: online ? "online" : peer.presence,
        lastMessage: last
          ? {
              text: last.content,
              sender: last.sender.name,
              at: last.createdAt.toISOString(),
            }
          : null,
      };
    })
    .filter(Boolean) as {
    id: string;
    slug: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    presence: string;
    lastMessage: { text: string; sender: string; at: string } | null;
  }[];
}

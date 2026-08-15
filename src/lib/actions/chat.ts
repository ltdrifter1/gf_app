"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { effectivePresence } from "@/lib/presence";
import { isNudgeMessage } from "@/lib/msn";

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
      profile: { select: { mood: true } },
    },
    orderBy: { name: "asc" },
    take: 40,
  });
}

export type ContactListEntry = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  presence: "online" | "away" | "offline";
  statusMessage: string | null;
  /** Existing DM room slug, if any */
  dmSlug: string | null;
  unreadCount: number;
  lastMessage: { text: string; sender: string; at: string } | null;
};

/** Classic MSN contact list: Online + Offline (DM peers & follows) — one row per person. */
export async function getContactList(userId: string) {
  const since = new Date(Date.now() - 60_000);

  const [onlineUsers, follows, dmMemberships] = await Promise.all([
    prisma.user.findMany({
      where: {
        id: { not: userId },
        presence: "online",
        lastSeen: { gte: since },
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        presence: true,
        lastSeen: true,
        profile: { select: { mood: true } },
      },
      orderBy: { name: "asc" },
      take: 50,
    }),
    prisma.follow.findMany({
      where: { followerId: userId },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            presence: true,
            lastSeen: true,
            profile: { select: { mood: true } },
          },
        },
      },
      take: 60,
    }),
    prisma.chatRoomMember.findMany({
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
                    profile: { select: { mood: true } },
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
    }),
  ]);

  type Raw = {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    presence: string;
    lastSeen: Date;
    profile: { mood: string | null } | null;
  };

  const byId = new Map<string, Raw>();
  for (const u of onlineUsers) byId.set(u.id, u);
  for (const f of follows) byId.set(f.following.id, f.following);
  for (const m of dmMemberships) {
    const peer = m.room.members[0]?.user;
    if (peer) byId.set(peer.id, peer);
  }

  type DmMeta = {
    dmSlug: string;
    unreadCount: number;
    lastMessage: { text: string; sender: string; at: string } | null;
  };
  const dmByPeer = new Map<string, DmMeta>();
  await Promise.all(
    dmMemberships.map(async (m) => {
      const peer = m.room.members[0]?.user;
      if (!peer) return;
      const last = m.room.messages[0];
      const unreadCount = await prisma.message.count({
        where: {
          roomId: m.room.id,
          senderId: { not: userId },
          createdAt: { gt: m.lastReadAt },
        },
      });
      dmByPeer.set(peer.id, {
        dmSlug: m.room.slug,
        unreadCount,
        lastMessage: last
          ? {
              text: isNudgeMessage(last.content) ? "sent a nudge!" : last.content,
              sender: last.sender.name,
              at: last.createdAt.toISOString(),
            }
          : null,
      });
    })
  );

  const online: ContactListEntry[] = [];
  const offline: ContactListEntry[] = [];

  for (const u of byId.values()) {
    const presence = effectivePresence(u.presence, u.lastSeen);
    const dm = dmByPeer.get(u.id);
    const row: ContactListEntry = {
      id: u.id,
      name: u.name,
      username: u.username,
      avatarUrl: u.avatarUrl,
      presence,
      statusMessage: u.profile?.mood?.trim() || null,
      dmSlug: dm?.dmSlug ?? null,
      unreadCount: dm?.unreadCount ?? 0,
      lastMessage: dm?.lastMessage ?? null,
    };
    if (presence === "online" || presence === "away") online.push(row);
    else offline.push(row);
  }

  // Unread first, then name — still one row per person
  const rank = (a: ContactListEntry, b: ContactListEntry) => {
    if ((b.unreadCount > 0) !== (a.unreadCount > 0)) return b.unreadCount > 0 ? 1 : -1;
    return a.name.localeCompare(b.name);
  };
  online.sort(rank);
  offline.sort(rank);

  return { online, offline, onlineCount: online.filter((c) => c.presence === "online").length + 1 };
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
  });

  const withUnread = await Promise.all(
    memberships.map(async (m) => {
      const peer = m.room.members[0]?.user;
      if (!peer) return null;
      const last = m.room.messages[0];
      const unreadCount = await prisma.message.count({
        where: {
          roomId: m.room.id,
          senderId: { not: userId },
          createdAt: { gt: m.lastReadAt },
        },
      });
      return {
        id: m.room.id,
        slug: m.room.slug,
        name: peer.name,
        username: peer.username,
        avatarUrl: peer.avatarUrl,
        presence: effectivePresence(peer.presence, peer.lastSeen),
        unreadCount,
        lastMessage: last
          ? {
              text: isNudgeMessage(last.content) ? "sent a nudge!" : last.content,
              sender: last.sender.name,
              at: last.createdAt.toISOString(),
            }
          : null,
      };
    })
  );

  return withUnread
    .filter(Boolean)
    .sort((a, b) => {
      const at = a!.lastMessage?.at ?? "";
      const bt = b!.lastMessage?.at ?? "";
      if (!at && !bt) return 0;
      if (!at) return 1;
      if (!bt) return -1;
      return bt.localeCompare(at);
    }) as {
    id: string;
    slug: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    presence: string;
    unreadCount: number;
    lastMessage: { text: string; sender: string; at: string } | null;
  }[];
}

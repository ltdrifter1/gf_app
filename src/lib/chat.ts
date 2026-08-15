import { prisma } from "@/lib/prisma";
import { ensureLaunchCatalog } from "@/lib/bootstrap";
import { isNudgeMessage } from "@/lib/msn";

export const ROOM_EMOJI: Record<string, string> = {
  "general-support": "💬",
  "newly-diagnosed": "🌱",
  "mental-health": "💙",
  parents: "👨‍👩‍👧",
  teens: "🎧",
};

export async function getRoomsWithStats(userId?: string) {
  await ensureLaunchCatalog();
  const rooms = await prisma.chatRoom.findMany({
    where: { isCommunity: true },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { members: true, messages: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { name: true } } },
      },
    },
  });

  const membershipByRoom = new Map<string, Date>();
  if (userId) {
    const memberships = await prisma.chatRoomMember.findMany({
      where: { userId, roomId: { in: rooms.map((r) => r.id) } },
      select: { roomId: true, lastReadAt: true },
    });
    for (const m of memberships) {
      membershipByRoom.set(m.roomId, m.lastReadAt);
    }
  }

  const onlineSince = new Date(Date.now() - 60000);
  return Promise.all(
    rooms.map(async (r) => {
      const online = await prisma.chatRoomMember.count({
        where: {
          roomId: r.id,
          user: { presence: "online", lastSeen: { gte: onlineSince } },
        },
      });
      const last = r.messages[0];
      let unreadCount = 0;
      const lastReadAt = membershipByRoom.get(r.id);
      if (userId && lastReadAt) {
        unreadCount = await prisma.message.count({
          where: {
            roomId: r.id,
            senderId: { not: userId },
            createdAt: { gt: lastReadAt },
          },
        });
      }
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        emoji: ROOM_EMOJI[r.slug] ?? "💬",
        members: r._count.members,
        messageCount: r._count.messages,
        online,
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
}

import { prisma } from "@/lib/prisma";

export const ROOM_EMOJI: Record<string, string> = {
  "general-support": "💬",
  "newly-diagnosed": "🌱",
  parents: "👨‍👩‍👧",
  teens: "🎧",
  "premium-lounge": "👑",
};

export async function getRoomsWithStats(opts?: { includePremium?: boolean }) {
  const includePremium = opts?.includePremium ?? false;
  const rooms = await prisma.chatRoom.findMany({
    where: {
      isCommunity: true,
      ...(includePremium ? {} : { isPremium: false }),
    },
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

  const onlineSince = new Date(Date.now() - 60000);
  const result = await Promise.all(
    rooms.map(async (r) => {
      const online = await prisma.chatRoomMember.count({
        where: {
          roomId: r.id,
          user: { presence: "online", lastSeen: { gte: onlineSince } },
        },
      });
      const last = r.messages[0];
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        emoji: ROOM_EMOJI[r.slug] ?? "💬",
        isPremium: r.isPremium,
        members: r._count.members,
        messageCount: r._count.messages,
        online,
        lastMessage: last
          ? {
              text: last.content,
              sender: last.sender.name,
              at: last.createdAt.toISOString(),
            }
          : null,
      };
    })
  );
  return result;
}

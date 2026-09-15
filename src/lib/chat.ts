import { prisma } from "@/lib/prisma";
import { ensureLaunchCatalog } from "@/lib/bootstrap";
import { isCheckinMessage, isNudgeMessage } from "@/lib/msn";
import { cityFromUserLocation, isCityTonightSlug } from "@/lib/city-rooms";
import { ensureCityTonightForUser } from "@/lib/city-tonight";
import { isLivePresence } from "@/lib/presence";

export const ROOM_EMOJI: Record<string, string> = {
  "general-support": "💬",
  "newly-diagnosed": "🌱",
  "mental-health": "💙",
  parents: "👨‍👩‍👧",
  teens: "🎧",
};

function previewText(content: string) {
  if (isNudgeMessage(content)) return "sent a nudge!";
  if (isCheckinMessage(content)) return "asked for a check-in";
  return content;
}

export async function getRoomsWithStats(userId?: string) {
  await ensureLaunchCatalog();

  let userCity: string | null = null;
  if (userId) {
    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { location: true },
    });
    userCity = cityFromUserLocation(me?.location);
    if (userCity) await ensureCityTonightForUser(me?.location);
  }

  const rooms = await prisma.chatRoom.findMany({
    where: {
      isCommunity: true,
      OR: [
        { kind: { not: "city-tonight" } },
        ...(userCity
          ? [{ kind: "city-tonight" as const, city: { equals: userCity, mode: "insensitive" as const } }]
          : []),
        ...(userId ? [{ members: { some: { userId } } }] : []),
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { members: true, messages: true } },
      messages: {
        where: { hidden: false },
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
  const mapped = await Promise.all(
    rooms.map(async (r) => {
      const members = await prisma.chatRoomMember.findMany({
        where: { roomId: r.id },
        select: { user: { select: { presence: true, lastSeen: true } } },
      });
      const online = members.filter(
        (m) => isLivePresence(m.user.presence) && m.user.lastSeen >= onlineSince
      ).length;
      const last = r.messages[0];
      let unreadCount = 0;
      const lastReadAt = membershipByRoom.get(r.id);
      if (userId && lastReadAt) {
        unreadCount = await prisma.message.count({
          where: {
            roomId: r.id,
            senderId: { not: userId },
            hidden: false,
            createdAt: { gt: lastReadAt },
          },
        });
      }
      const cityRoom = r.kind === "city-tonight" || isCityTonightSlug(r.slug);
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        emoji: cityRoom ? "🌃" : (ROOM_EMOJI[r.slug] ?? "💬"),
        kind: r.kind,
        city: r.city,
        members: r._count.members,
        messageCount: r._count.messages,
        online,
        unreadCount,
        lastMessage: last
          ? {
              text: previewText(last.content),
              sender: last.sender.name,
              at: last.createdAt.toISOString(),
            }
          : null,
      };
    })
  );

  mapped.sort((a, b) => {
    const aCity = a.kind === "city-tonight" ? 1 : 0;
    const bCity = b.kind === "city-tonight" ? 1 : 0;
    if (aCity !== bCity) return bCity - aCity;
    return 0;
  });

  return mapped;
}

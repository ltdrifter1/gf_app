import "server-only";
import { prisma } from "@/lib/prisma";
import { isBlockedEitherWay } from "@/lib/blocks";
import { isPendingDm } from "@/lib/dm";

/** Ensure user may access a room. Community rooms auto-join; DMs require membership. */
export async function assertRoomAccess(roomId: string, userId: string) {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: { members: { select: { userId: true } } },
  });
  if (!room) return { ok: false as const, status: 404 as const, error: "not found" };

  if (room.hidden) {
    const actor = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (actor?.role !== "ADMIN") {
      return { ok: false as const, status: 404 as const, error: "not found" };
    }
  }

  if (room.kind === "city-tonight-archive") {
    const membership = await prisma.chatRoomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (!membership) return { ok: false as const, status: 403 as const, error: "archived" };
  }

  const peers = room.members.map((m) => m.userId).filter((id) => id !== userId);
  for (const peer of peers) {
    if (await isBlockedEitherWay(userId, peer)) {
      return { ok: false as const, status: 403 as const, error: "blocked" };
    }
  }

  const membership = await prisma.chatRoomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });

  if (membership) {
    return {
      ok: true as const,
      room,
      pendingDm: isPendingDm(room),
    };
  }

  if (room.isCommunity && room.kind !== "city-tonight-archive") {
    await prisma.chatRoomMember.create({ data: { roomId, userId } });
    return { ok: true as const, room, pendingDm: false };
  }

  return { ok: false as const, status: 403 as const, error: "forbidden" };
}

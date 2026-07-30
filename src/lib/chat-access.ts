import "server-only";
import { prisma } from "@/lib/prisma";

/** Ensure user may access a room. Community rooms auto-join; DMs require membership. */
export async function assertRoomAccess(roomId: string, userId: string) {
  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room) return { ok: false as const, status: 404 as const, error: "not found" };

  const membership = await prisma.chatRoomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });

  if (membership) return { ok: true as const, room };

  if (room.isCommunity) {
    await prisma.chatRoomMember.create({ data: { roomId, userId } });
    return { ok: true as const, room };
  }

  return { ok: false as const, status: 403 as const, error: "forbidden" };
}

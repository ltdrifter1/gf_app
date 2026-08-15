import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assertRoomAccess } from "@/lib/chat-access";
import { publishChat } from "@/lib/chat-events";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const { roomId } = await params;

  const access = await assertRoomAccess(roomId, user.id);
  if (!access.ok) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }

  const now = new Date();
  await prisma.chatRoomMember.updateMany({
    where: { roomId, userId: user.id },
    data: { lastReadAt: now },
  });

  publishChat(roomId, {
    type: "read",
    userId: user.id,
    lastReadAt: now.toISOString(),
  });

  return NextResponse.json({ ok: true, lastReadAt: now.toISOString() });
}

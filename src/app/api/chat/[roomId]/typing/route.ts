import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assertRoomAccess } from "@/lib/chat-access";

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

  await prisma.typingIndicator.upsert({
    where: { roomId_userId: { roomId, userId: user.id } },
    create: { roomId, userId: user.id },
    update: { updatedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}

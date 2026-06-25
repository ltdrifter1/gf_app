import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const { roomId } = await params;

  await prisma.typingIndicator.upsert({
    where: { roomId_userId: { roomId, userId: user.id } },
    create: { roomId, userId: user.id },
    update: { updatedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}

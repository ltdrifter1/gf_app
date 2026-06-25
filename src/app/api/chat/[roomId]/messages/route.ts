import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { roomId } = await params;

  const messages = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: { sender: { select: { id: true, name: true, username: true, avatarUrl: true, presence: true } } },
  });

  // typing users active in the last 6 seconds (excluding me)
  const since = new Date(Date.now() - 6000);
  const typing = await prisma.typingIndicator.findMany({
    where: { roomId, updatedAt: { gte: since }, NOT: { userId: user.id } },
    include: { user: { select: { name: true } } },
  });

  // online members of the room
  const onlineSince = new Date(Date.now() - 60000);
  const members = await prisma.chatRoomMember.findMany({
    where: { roomId },
    include: { user: { select: { id: true, name: true, username: true, avatarUrl: true, presence: true, lastSeen: true } } },
  });
  const online = members.filter(
    (m) => m.user.presence === "online" && m.user.lastSeen >= onlineSince
  ).length;

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      sender: m.sender,
      mine: m.senderId === user.id,
    })),
    typing: typing.map((t) => t.user.name),
    online,
    memberCount: members.length,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { roomId } = await params;
  const body = await req.json().catch(() => ({}));
  const content = String(body.content || "").trim();
  if (!content) return NextResponse.json({ error: "empty" }, { status: 400 });

  // Ensure membership (auto-join community rooms)
  await prisma.chatRoomMember.upsert({
    where: { roomId_userId: { roomId, userId: user.id } },
    create: { roomId, userId: user.id },
    update: {},
  });

  const message = await prisma.message.create({
    data: { roomId, senderId: user.id, content },
    include: { sender: { select: { id: true, name: true, username: true, avatarUrl: true, presence: true } } },
  });

  // clear typing indicator
  await prisma.typingIndicator
    .deleteMany({ where: { roomId, userId: user.id } })
    .catch(() => {});

  return NextResponse.json({
    message: {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      sender: message.sender,
      mine: true,
    },
  });
}

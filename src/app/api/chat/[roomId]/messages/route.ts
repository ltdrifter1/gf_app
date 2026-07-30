import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assertRoomAccess } from "@/lib/chat-access";
import { effectivePresence } from "@/lib/presence";

const MAX_CONTENT = 2000;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { roomId } = await params;

  const access = await assertRoomAccess(roomId, user.id);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  // Latest 100 chronologically (newest first, then reverse for UI)
  const recent = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      sender: {
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
  });
  const messages = recent.reverse();

  const since = new Date(Date.now() - 6000);
  const typing = await prisma.typingIndicator.findMany({
    where: { roomId, updatedAt: { gte: since }, NOT: { userId: user.id } },
    include: { user: { select: { name: true } } },
  });

  const onlineSince = new Date(Date.now() - 60000);
  const members = await prisma.chatRoomMember.findMany({
    where: { roomId },
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
  });
  const online = members.filter(
    (m) => effectivePresence(m.user.presence, m.user.lastSeen) === "online"
  ).length;

  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    select: { isCommunity: true },
  });

  let peerPresence: string | null = null;
  let peerLastSeen: string | null = null;
  if (room && !room.isCommunity) {
    const peer = members.find((m) => m.user.id !== user.id)?.user;
    if (peer) {
      peerPresence = effectivePresence(peer.presence, peer.lastSeen);
      peerLastSeen = peer.lastSeen.toISOString();
    }
  }

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      sender: {
        id: m.sender.id,
        name: m.sender.name,
        username: m.sender.username,
        avatarUrl: m.sender.avatarUrl,
        presence: effectivePresence(m.sender.presence, m.sender.lastSeen),
      },
      mine: m.senderId === user.id,
    })),
    typing: typing.map((t) => t.user.name),
    online,
    memberCount: members.length,
    peerPresence,
    peerLastSeen,
    serverNow: onlineSince.toISOString(),
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
  if (content.length > MAX_CONTENT) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const access = await assertRoomAccess(roomId, user.id);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const message = await prisma.message.create({
    data: { roomId, senderId: user.id, content },
    include: {
      sender: {
        select: { id: true, name: true, username: true, avatarUrl: true, presence: true },
      },
    },
  });

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

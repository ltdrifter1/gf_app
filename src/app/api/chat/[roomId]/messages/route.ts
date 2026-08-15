import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assertRoomAccess } from "@/lib/chat-access";
import { effectivePresence } from "@/lib/presence";
import { rateLimit } from "@/lib/rate-limit";
import { NUDGE_CONTENT, isNudgeMessage } from "@/lib/msn";
import { publishChat } from "@/lib/chat-events";
import { createNotification } from "@/lib/actions/notifications";

const MAX_CONTENT = 2000;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function serializeMessage(
  m: {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    sender: {
      id: string;
      name: string;
      username: string;
      avatarUrl: string | null;
      presence: string;
      lastSeen?: Date;
    };
  },
  userId: string
) {
  return {
    id: m.id,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    isNudge: isNudgeMessage(m.content),
    sender: {
      id: m.sender.id,
      name: m.sender.name,
      username: m.sender.username,
      avatarUrl: m.sender.avatarUrl,
      presence: m.sender.lastSeen
        ? effectivePresence(m.sender.presence, m.sender.lastSeen)
        : m.sender.presence,
    },
    mine: m.senderId === userId,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { roomId } = await params;

  const access = await assertRoomAccess(roomId, user.id);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const url = req.nextUrl;
  const before = url.searchParams.get("before");
  const limitRaw = Number(url.searchParams.get("limit") || DEFAULT_LIMIT);
  const limit = Math.min(Math.max(1, Number.isFinite(limitRaw) ? limitRaw : DEFAULT_LIMIT), MAX_LIMIT);

  let beforeCursor: { createdAt: Date; id: string } | null = null;
  if (before) {
    const cursorMsg = await prisma.message.findFirst({
      where: { id: before, roomId },
      select: { id: true, createdAt: true },
    });
    if (cursorMsg) {
      beforeCursor = { createdAt: cursorMsg.createdAt, id: cursorMsg.id };
    }
  }

  const recent = await prisma.message.findMany({
    where: {
      roomId,
      ...(beforeCursor
        ? {
            OR: [
              { createdAt: { lt: beforeCursor.createdAt } },
              {
                createdAt: beforeCursor.createdAt,
                id: { lt: beforeCursor.id },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
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

  const hasMore = recent.length > limit;
  const page = hasMore ? recent.slice(0, limit) : recent;
  const messages = page.reverse();

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

  // Fresh open (no pagination cursor) marks read
  if (!before) {
    await prisma.chatRoomMember.updateMany({
      where: { roomId, userId: user.id },
      data: { lastReadAt: new Date() },
    });
  }

  return NextResponse.json({
    messages: messages.map((m) => serializeMessage(m, user.id)),
    hasMore,
    nextCursor: messages.length > 0 ? messages[0].id : null,
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

  const limited = rateLimit(`chat:${user.id}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Slow down — try again in ${limited.retryAfterSec}s` },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  const { roomId } = await params;
  const body = await req.json().catch(() => ({}));
  const isNudge = body?.type === "nudge" || isNudgeMessage(String(body.content || ""));

  if (isNudge) {
    const nudgeLimit = rateLimit(`nudge:${user.id}`, 8, 60_000);
    if (!nudgeLimit.ok) {
      return NextResponse.json(
        { error: `Easy on the nudges — try again in ${nudgeLimit.retryAfterSec}s` },
        { status: 429, headers: { "Retry-After": String(nudgeLimit.retryAfterSec) } }
      );
    }
  }

  const content = isNudge ? NUDGE_CONTENT : String(body.content || "").trim();
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

  await prisma.typingIndicator
    .deleteMany({ where: { roomId, userId: user.id } })
    .catch(() => {});

  // Sender has read up through their own message
  await prisma.chatRoomMember.updateMany({
    where: { roomId, userId: user.id },
    data: { lastReadAt: new Date() },
  });

  const payload = serializeMessage(message, user.id);

  publishChat(roomId, {
    type: "message",
    message: {
      id: payload.id,
      content: payload.content,
      createdAt: payload.createdAt,
      isNudge: payload.isNudge,
      sender: payload.sender,
    },
  });

  publishChat(roomId, { type: "typing", names: [] });

  // In-app notifications for DM peers (and keep community quiet)
  if (!access.room.isCommunity) {
    const peers = await prisma.chatRoomMember.findMany({
      where: { roomId, userId: { not: user.id } },
      select: { userId: true },
    });
    const preview = isNudge
      ? `${user.name} sent a nudge`
      : content.slice(0, 120);
    await Promise.all(
      peers.map((p) =>
        createNotification({
          userId: p.userId,
          type: "message",
          title: user.name,
          body: preview,
          href: `/app/chat/${access.room.slug}`,
        }).catch(() => null)
      )
    );
  }

  return NextResponse.json({ message: payload });
}

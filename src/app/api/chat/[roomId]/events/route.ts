import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assertRoomAccess } from "@/lib/chat-access";
import { effectivePresence } from "@/lib/presence";
import { publishChat, subscribeChat, type ChatStreamEvent } from "@/lib/chat-events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEARTBEAT_MS = 15_000;
const SNAPSHOT_MS = 8_000;

async function roomSnapshot(roomId: string, userId: string) {
  const onlineSince = new Date(Date.now() - 60_000);
  const members = await prisma.chatRoomMember.findMany({
    where: { roomId },
    include: {
      user: {
        select: {
          id: true,
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
  if (room && !room.isCommunity) {
    const peer = members.find((m) => m.user.id !== userId)?.user;
    if (peer) {
      peerPresence = effectivePresence(peer.presence, peer.lastSeen);
    }
  }

  const since = new Date(Date.now() - 6_000);
  const typing = await prisma.typingIndicator.findMany({
    where: { roomId, updatedAt: { gte: since }, NOT: { userId } },
    include: { user: { select: { name: true } } },
  });

  return {
    presence: {
      type: "presence" as const,
      online,
      memberCount: members.length,
      peerPresence,
    },
    typing: {
      type: "typing" as const,
      names: typing.map((t) => t.user.name),
    },
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("unauthorized", { status: 401 });
  }

  const { roomId } = await params;
  const access = await assertRoomAccess(roomId, user.id);
  if (!access.ok) {
    return new Response(access.error, { status: access.status });
  }

  // Opening the stream marks the room read
  await prisma.chatRoomMember.updateMany({
    where: { roomId, userId: user.id },
    data: { lastReadAt: new Date() },
  });

  const encoder = new TextEncoder();
  let cleanup = () => {};
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let snapshot: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: ChatStreamEvent | { type: "hello" } | { type: "ping" }) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          closed = true;
        }
      };

      const onEvent = (event: ChatStreamEvent) => {
        if (event.type === "message") {
          send({
            ...event,
            message: {
              ...event.message,
              mine: event.message.sender.id === user.id,
            },
          });
          // Viewer is in the room — keep read cursor fresh for inbound mail
          if (event.message.sender.id !== user.id) {
            prisma.chatRoomMember
              .updateMany({
                where: { roomId, userId: user.id },
                data: { lastReadAt: new Date() },
              })
              .catch(() => {});
          }
          return;
        }
        send(event);
      };

      cleanup = subscribeChat(roomId, onEvent);
      send({ type: "hello" });

      roomSnapshot(roomId, user.id)
        .then((snap) => {
          send(snap.presence);
          send(snap.typing);
        })
        .catch(() => {});

      heartbeat = setInterval(() => send({ type: "ping" }), HEARTBEAT_MS);
      snapshot = setInterval(() => {
        roomSnapshot(roomId, user.id)
          .then((snap) => {
            send(snap.presence);
            send(snap.typing);
          })
          .catch(() => {});
      }, SNAPSHOT_MS);

      const abort = () => {
        if (closed) return;
        closed = true;
        if (heartbeat) clearInterval(heartbeat);
        if (snapshot) clearInterval(snapshot);
        cleanup();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      req.signal.addEventListener("abort", abort);
    },
    cancel() {
      closed = true;
      if (heartbeat) clearInterval(heartbeat);
      if (snapshot) clearInterval(snapshot);
      cleanup();
    },
  });

  // Touch publish so tree-shaking keeps the hub linked from this module graph
  void publishChat;

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

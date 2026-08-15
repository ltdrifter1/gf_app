/**
 * Chat fan-out: in-process hub (same Node process) + Postgres ChatBusEvent
 * so multi-instance / serverless hosts can still deliver via SSE bus polling.
 */

import "server-only";
import { prisma } from "@/lib/prisma";

export type ChatStreamEvent =
  | {
      type: "message";
      message: {
        id: string;
        content: string;
        createdAt: string;
        isNudge: boolean;
        sender: {
          id: string;
          name: string;
          username: string;
          avatarUrl: string | null;
          presence: string;
        };
        mine?: boolean;
      };
    }
  | {
      type: "typing";
      names: string[];
    }
  | {
      type: "presence";
      online: number;
      memberCount: number;
      peerPresence: string | null;
    }
  | {
      type: "read";
      userId: string;
      lastReadAt: string;
    };

type Listener = (event: ChatStreamEvent) => void;

const globalForChat = globalThis as unknown as {
  __safelyChatHub?: Map<string, Set<Listener>>;
};

const rooms = globalForChat.__safelyChatHub ?? new Map<string, Set<Listener>>();
globalForChat.__safelyChatHub = rooms;

export function subscribeChat(roomId: string, listener: Listener) {
  let set = rooms.get(roomId);
  if (!set) {
    set = new Set();
    rooms.set(roomId, set);
  }
  set.add(listener);
  return () => {
    set!.delete(listener);
    if (set!.size === 0) rooms.delete(roomId);
  };
}

function fanLocal(roomId: string, event: ChatStreamEvent) {
  const set = rooms.get(roomId);
  if (!set) return;
  for (const listener of set) {
    try {
      listener(event);
    } catch {
      /* ignore broken listeners */
    }
  }
}

/** Publish to local hub + durable bus (best-effort). */
export function publishChat(roomId: string, event: ChatStreamEvent) {
  fanLocal(roomId, event);

  // Persist message/read events for cross-instance delivery. Skip high-churn typing/presence.
  if (event.type === "typing" || event.type === "presence") return;

  void prisma.chatBusEvent
    .create({
      data: {
        roomId,
        payload: event as object,
      },
    })
    .catch(() => {});
}

/** Poll durable bus for events strictly after `after` timestamp. */
export async function fetchBusEventsSince(roomId: string, after: Date, limit = 50) {
  const rows = await prisma.chatBusEvent.findMany({
    where: { roomId, createdAt: { gt: after } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    createdAt: r.createdAt,
    event: r.payload as ChatStreamEvent,
  }));
}

/** Trim old bus rows (called opportunistically). */
export async function pruneChatBus(olderThanMs = 1000 * 60 * 60 * 6) {
  const cutoff = new Date(Date.now() - olderThanMs);
  await prisma.chatBusEvent.deleteMany({ where: { createdAt: { lt: cutoff } } }).catch(() => {});
}

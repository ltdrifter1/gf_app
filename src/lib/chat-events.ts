/**
 * In-process pub/sub for Messenger SSE.
 * Works across connections on the same Node process (local `next dev`,
 * single long-lived Node host). Multi-instance serverless may miss
 * cross-instance fan-out; clients still hydrate via history + reconnect.
 */

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

export function publishChat(roomId: string, event: ChatStreamEvent) {
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

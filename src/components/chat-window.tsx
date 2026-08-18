"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Avatar } from "./ui/avatar";
import { MsnPresenceIcon } from "./msn-presence-icon";
import { msnSaysColor } from "./msn-window-chrome";
import { timeAgo, cn } from "@/lib/utils";
import { presenceLabel } from "@/lib/presence";
import { isNudgeMessage, nudgeSystemLine } from "@/lib/msn";
import { playMessageSound, playNudgeSound } from "@/lib/msn-sounds";
import { notifyMsnMessage } from "@/lib/msn-prefs";

type Msg = {
  id: string;
  content: string;
  createdAt: string;
  mine: boolean;
  pending?: boolean;
  failed?: boolean;
  isNudge?: boolean;
  sender: { id: string; name: string; avatarUrl: string | null; presence: string };
};

export function ChatWindow({
  roomId,
  roomName,
  roomEmoji,
  description,
  isDm,
  peerAvatar,
  peerPresence: initialPeerPresence,
  peerStatusMessage,
  embedded = false,
}: {
  roomId: string;
  roomName: string;
  roomEmoji: string;
  description?: string | null;
  isDm?: boolean;
  peerAvatar?: string | null;
  peerPresence?: string | null;
  peerStatusMessage?: string | null;
  embedded?: boolean;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState<string[]>([]);
  const [online, setOnline] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [peerPresence, setPeerPresence] = useState(initialPeerPresence ?? "offline");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [nudging, setNudging] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [live, setLive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTypingSent = useRef(0);
  const initialised = useRef(false);
  const seenIds = useRef<Set<string>>(new Set());
  const soundsReady = useRef(false);
  const loadingOlderRef = useRef(false);

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    });
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    window.setTimeout(() => setShake(false), 600);
  }, []);

  const ingestMessages = useCallback(
    (incoming: Msg[], { prepend = false }: { prepend?: boolean } = {}) => {
      setMessages((prev) => {
        const pending = prev.filter((m) => m.pending || m.failed);
        const mapped: Msg[] = incoming.map((m) => ({
          ...m,
          isNudge: m.isNudge || isNudgeMessage(m.content),
        }));

        if (soundsReady.current && initialised.current && !prepend) {
          for (const m of mapped) {
            if (seenIds.current.has(m.id) || m.mine) continue;
            if (m.isNudge) {
              playNudgeSound();
              triggerShake();
              notifyMsnMessage(roomName, `${m.sender.name} sent a nudge!`);
            } else {
              playMessageSound();
              notifyMsnMessage(roomName, `${m.sender.name}: ${m.content.slice(0, 120)}`);
            }
          }
        }
        for (const m of mapped) seenIds.current.add(m.id);

        let next: Msg[];
        if (prepend) {
          const existing = new Set(prev.map((m) => m.id));
          const older = mapped.filter((m) => !existing.has(m.id));
          next = [...older, ...prev];
        } else {
          const byId = new Map<string, Msg>();
          for (const m of prev) {
            if (!m.pending && !m.failed) byId.set(m.id, m);
          }
          for (const m of mapped) byId.set(m.id, m);
          const serverIds = new Set(mapped.map((m) => m.id));
          const keepPending = pending.filter((m) => !serverIds.has(m.id));
          next = [...Array.from(byId.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt)), ...keepPending];
        }

        if (!prepend) {
          const grew = next.length !== prev.length || next.at(-1)?.id !== prev.at(-1)?.id;
          if (grew) {
            const wasAtBottom =
              !scrollRef.current ||
              scrollRef.current.scrollHeight -
                scrollRef.current.scrollTop -
                scrollRef.current.clientHeight <
                120;
            if (wasAtBottom || !initialised.current) scrollToBottom(initialised.current);
          }
        }
        return next;
      });
    },
    [scrollToBottom, triggerShake, roomName]
  );

  const loadInitial = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${roomId}/messages?limit=50`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      ingestMessages(data.messages || []);
      setHasMore(Boolean(data.hasMore));
      setTyping(data.typing || []);
      setOnline(data.online || 0);
      setMemberCount(data.memberCount || 0);
      if (typeof data.peerPresence === "string") {
        setPeerPresence(data.peerPresence);
      }
      initialised.current = true;
      scrollToBottom(false);
    } catch {
      /* ignore network blips */
    }
  }, [roomId, ingestMessages, scrollToBottom]);

  const loadOlder = useCallback(async () => {
    if (loadingOlderRef.current || !hasMore) return;
    const oldest = messages.find((m) => !m.pending && !m.failed);
    if (!oldest) return;

    loadingOlderRef.current = true;
    setLoadingOlder(true);
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    const prevTop = el?.scrollTop ?? 0;

    try {
      const res = await fetch(
        `/api/chat/${roomId}/messages?limit=50&before=${encodeURIComponent(oldest.id)}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      ingestMessages(data.messages || [], { prepend: true });
      setHasMore(Boolean(data.hasMore));
      requestAnimationFrame(() => {
        if (!scrollRef.current) return;
        const delta = scrollRef.current.scrollHeight - prevHeight;
        scrollRef.current.scrollTop = prevTop + delta;
      });
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  }, [hasMore, messages, roomId, ingestMessages]);

  useEffect(() => {
    initialised.current = false;
    seenIds.current = new Set();
    soundsReady.current = false;
    setMessages([]);
    setSendError(null);
    setHasMore(false);
    setLive(false);
    setPeerPresence(initialPeerPresence ?? "offline");

    loadInitial().then(() => {
      window.setTimeout(() => {
        soundsReady.current = true;
      }, 800);
    });

    let es: EventSource | null = null;
    let pollFallback: ReturnType<typeof setInterval> | null = null;
    let closed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const startFallbackPoll = () => {
      if (pollFallback || closed) return;
      pollFallback = setInterval(() => {
        fetch(`/api/chat/${roomId}/messages?limit=50`, { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (!data) return;
            ingestMessages(data.messages || []);
            setTyping(data.typing || []);
            setOnline(data.online || 0);
            setMemberCount(data.memberCount || 0);
            if (typeof data.peerPresence === "string") setPeerPresence(data.peerPresence);
          })
          .catch(() => {});
      }, 4000);
    };

    const connect = () => {
      if (closed) return;
      es?.close();
      es = new EventSource(`/api/chat/${roomId}/events`);

      es.onopen = () => {
        setLive(true);
        if (pollFallback) {
          clearInterval(pollFallback);
          pollFallback = null;
        }
      };

      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as {
            type: string;
            message?: Msg;
            names?: string[];
            online?: number;
            memberCount?: number;
            peerPresence?: string | null;
          };
          if (data.type === "ping" || data.type === "hello") return;
          if (data.type === "message" && data.message) {
            ingestMessages([data.message]);
            return;
          }
          if (data.type === "typing" && Array.isArray(data.names)) {
            setTyping(data.names);
            return;
          }
          if (data.type === "presence") {
            if (typeof data.online === "number") setOnline(data.online);
            if (typeof data.memberCount === "number") setMemberCount(data.memberCount);
            if (typeof data.peerPresence === "string") setPeerPresence(data.peerPresence);
          }
        } catch {
          /* ignore malformed */
        }
      };

      es.onerror = () => {
        setLive(false);
        es?.close();
        startFallbackPoll();
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connect, 2500);
      };
    };

    connect();

    return () => {
      closed = true;
      es?.close();
      if (pollFallback) clearInterval(pollFallback);
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [roomId, initialPeerPresence, loadInitial, ingestMessages]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el || loadingOlderRef.current || !hasMore) return;
    if (el.scrollTop < 80) {
      void loadOlder();
    }
  }

  function onType(value: string) {
    setInput(value);
    if (sendError) setSendError(null);
    const now = Date.now();
    if (now - lastTypingSent.current > 2000) {
      lastTypingSent.current = now;
      fetch(`/api/chat/${roomId}/typing`, { method: "POST" }).catch(() => {});
    }
  }

  async function send() {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setSendError(null);
    setInput("");
    const tmpId = `tmp-${Date.now()}`;
    const optimistic: Msg = {
      id: tmpId,
      content,
      createdAt: new Date().toISOString(),
      mine: true,
      pending: true,
      sender: { id: "me", name: "You", avatarUrl: null, presence: "online" },
    };
    setMessages((m) => [...m, optimistic]);
    scrollToBottom();
    try {
      const res = await fetch(`/api/chat/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Couldn't send");
      }
      const data = await res.json();
      seenIds.current.add(data.message.id);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === tmpId
            ? { ...data.message, mine: true, pending: false, isNudge: false }
            : msg
        )
      );
    } catch (err) {
      setMessages((m) =>
        m.map((msg) => (msg.id === tmpId ? { ...msg, pending: false, failed: true } : msg))
      );
      setInput(content);
      setSendError(err instanceof Error ? err.message : "Couldn't send — try again");
    } finally {
      setSending(false);
    }
  }

  async function sendNudge() {
    if (nudging || sending) return;
    setNudging(true);
    setSendError(null);
    playNudgeSound();
    triggerShake();
    try {
      const res = await fetch(`/api/chat/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "nudge" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Couldn't nudge");
      }
      const data = await res.json();
      seenIds.current.add(data.message.id);
      setMessages((m) => {
        if (m.some((msg) => msg.id === data.message.id)) return m;
        return [
          ...m,
          {
            ...data.message,
            mine: true,
            isNudge: true,
            sender: data.message.sender,
          },
        ];
      });
      scrollToBottom();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Couldn't nudge");
    } finally {
      setNudging(false);
    }
  }

  const status = (peerPresence || "offline") as "online" | "away" | "offline";
  const typingLine =
    typing.length === 0
      ? null
      : typing.length === 1
        ? `${typing[0]} is typing a message…`
        : `${typing.slice(0, 2).join(" and ")} are typing a message…`;

  const subtitleLine = isDm
    ? peerStatusMessage
      ? `${presenceLabel(status)} — ${peerStatusMessage}`
      : presenceLabel(status)
    : `${online} online · Lounge`;

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col",
        !embedded && "msn-window msn-window-hero msn-window-fill",
        shake && "msn-nudge-shake"
      )}
    >
      <div className="msn-hero-peer shrink-0">
        {isDm ? (
          <div className="msn-hero-avatar">
            <Avatar
              name={roomName}
              src={peerAvatar ?? null}
              size={44}
              presence={status}
              className="h-full w-full rounded-[0.55rem]"
            />
          </div>
        ) : (
          <div className="msn-hero-avatar grid place-items-center bg-white text-lg">
            {roomEmoji ? (
              <span aria-hidden>{roomEmoji}</span>
            ) : (
              <Image
                src="/logo.webp"
                alt=""
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] font-semibold tracking-tight text-[#0a3a6e] dark:text-white">
            {roomName}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#4a5568] dark:text-sage-400">
            <MsnPresenceIcon
              status={isDm ? status : online > 0 ? "online" : "offline"}
              size={11}
            />
            <span className="truncate">{subtitleLine}</span>
            {!live ? (
              <span className="shrink-0 text-[10px] text-[#94a3b8]">· syncing</span>
            ) : null}
          </p>
          {description && !isDm ? (
            <p className="mt-0.5 truncate text-[11px] text-[#64748b] dark:text-sage-500">
              {description}
            </p>
          ) : null}
        </div>
        {memberCount > 0 && !isDm ? (
          <p className="hidden shrink-0 text-[10px] tabular-nums text-[#64748b] sm:block">
            {memberCount} members
          </p>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="msn-inset m-2.5 min-h-0 flex-1 space-y-3 overflow-y-auto p-3.5"
      >
        {hasMore && (
          <p className="text-center text-[11px] text-[#94a3b8]">
            {loadingOlder ? "Loading earlier messages…" : "Scroll up for earlier messages"}
          </p>
        )}
        {messages.length === 0 && (
          <p className="mt-8 text-center text-[13px] text-[#64748b]">
            This is the beginning of your conversation. Say hello!
          </p>
        )}
        {messages.map((m) => {
          const nudge = m.isNudge || isNudgeMessage(m.content);
          if (nudge) {
            return (
              <p
                key={m.id}
                className={cn(
                  "text-center text-[12px] italic text-[#92400e] dark:text-amber-200/90",
                  m.failed && "text-rose-600"
                )}
              >
                * {nudgeSystemLine(m.mine ? roomName : m.sender.name, m.mine)}
                <span className="ml-2 not-italic text-[10px] text-[#94a3b8]">
                  {m.pending ? "Sending…" : m.failed ? "Failed" : timeAgo(m.createdAt)}
                </span>
              </p>
            );
          }

          const displayName = m.mine ? "You" : m.sender.name;
          return (
            <div
              key={m.id}
              className={cn(
                "msn-says",
                m.pending && "opacity-70",
                m.failed && "opacity-90"
              )}
            >
              <p>
                <span
                  className="msn-says-name"
                  style={{ color: msnSaysColor(displayName, m.mine) }}
                >
                  {displayName} says:
                </span>
              </p>
              <p
                className={cn(
                  "whitespace-pre-wrap break-words pl-0.5 text-[13.5px] leading-relaxed text-[#1a1a1a] dark:text-sage-100",
                  m.failed && "text-rose-700 dark:text-rose-300"
                )}
              >
                {m.content}
              </p>
              <p className="mt-0.5 pl-0.5 text-[10px] text-[#94a3b8]">
                {m.failed ? "Failed to send" : m.pending ? "Sending…" : timeAgo(m.createdAt)}
              </p>
            </div>
          );
        })}
      </div>

      {sendError && (
        <p className="px-3 pb-1 text-[11px] text-rose-600" role="alert">
          {sendError}
        </p>
      )}

      <div className="msn-composer shrink-0">
        <button
          type="button"
          className="msn-nudge-btn"
          onClick={sendNudge}
          disabled={nudging || sending}
          title="Nudge"
        >
          Nudge!
        </button>
        <input
          value={input}
          onChange={(e) => onType(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          maxLength={2000}
          placeholder={`Message ${roomName}…`}
          className="msn-input flex-1"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !input.trim()}
          className="msn-send"
        >
          Send
        </button>
      </div>

      <div className="msn-statusbar shrink-0">
        {typingLine ? (
          <span className="italic">{typingLine}</span>
        ) : (
          <span>
            {isDm
              ? `${roomName} is ${presenceLabel(status).toLowerCase()}`
              : `${online} people online`}
          </span>
        )}
      </div>
    </div>
  );
}

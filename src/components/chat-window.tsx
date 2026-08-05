"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Avatar } from "./ui/avatar";
import { MsnPresenceIcon } from "./msn-presence-icon";
import { timeAgo, cn } from "@/lib/utils";
import { presenceLabel } from "@/lib/presence";
import { isNudgeMessage, nudgeSystemLine } from "@/lib/msn";
import { playMessageSound, playNudgeSound } from "@/lib/msn-sounds";

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
}: {
  roomId: string;
  roomName: string;
  roomEmoji: string;
  description?: string | null;
  isDm?: boolean;
  peerAvatar?: string | null;
  peerPresence?: string | null;
  peerStatusMessage?: string | null;
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTypingSent = useRef(0);
  const initialised = useRef(false);
  const seenIds = useRef<Set<string>>(new Set());
  const soundsReady = useRef(false);

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

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${roomId}/messages`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setMessages((prev) => {
        const pending = prev.filter((m) => m.pending || m.failed);
        const serverIds = new Set(data.messages.map((m: Msg) => m.id));
        const keepPending = pending.filter((m) => !serverIds.has(m.id));
        const mapped: Msg[] = data.messages.map((m: Msg) => ({
          ...m,
          isNudge: m.isNudge || isNudgeMessage(m.content),
        }));

        if (soundsReady.current && initialised.current) {
          for (const m of mapped) {
            if (seenIds.current.has(m.id) || m.mine) continue;
            if (m.isNudge) {
              playNudgeSound();
              triggerShake();
            } else {
              playMessageSound();
            }
          }
        }
        for (const m of mapped) seenIds.current.add(m.id);

        const next = [...mapped, ...keepPending];
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
        return next;
      });
      setTyping(data.typing || []);
      setOnline(data.online || 0);
      setMemberCount(data.memberCount || 0);
      if (typeof data.peerPresence === "string") {
        setPeerPresence(data.peerPresence);
      }
      initialised.current = true;
    } catch {
      /* ignore network blips */
    }
  }, [roomId, scrollToBottom, triggerShake]);

  useEffect(() => {
    initialised.current = false;
    seenIds.current = new Set();
    soundsReady.current = false;
    setMessages([]);
    setSendError(null);
    setPeerPresence(initialPeerPresence ?? "offline");
    load().then(() => {
      // Avoid playing catch-up sounds for history
      window.setTimeout(() => {
        soundsReady.current = true;
      }, 800);
    });
    const id = setInterval(load, 2500);
    return () => clearInterval(id);
  }, [load, initialPeerPresence]);

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
      await load();
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
      setMessages((m) => [
        ...m,
        {
          ...data.message,
          mine: true,
          isNudge: true,
          sender: data.message.sender,
        },
      ]);
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

  return (
    <div className={cn("msn-window h-[calc(100vh-7rem)]", shake && "msn-nudge-shake")}>
      <div className="msn-titlebar">
        <MsnPresenceIcon status={isDm ? status : online > 0 ? "online" : "offline"} size={14} />
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold tracking-wide">
          {roomName} — Instant Message
        </span>
        <span className="msn-titlebar-btn" aria-hidden>
          _
        </span>
        <span className="msn-titlebar-btn" aria-hidden>
          □
        </span>
        <span className="msn-titlebar-btn" aria-hidden>
          ×
        </span>
      </div>

      <div className="msn-menubar">
        <button type="button">File</button>
        <button type="button">Edit</button>
        <button type="button" onClick={sendNudge} disabled={nudging}>
          Actions
        </button>
        <button type="button">Tools</button>
        <button type="button">Help</button>
      </div>

      {/* Display picture + identity strip */}
      <div className="flex items-center gap-3 border-b border-[#a0a0a0] bg-[#f5f4ec] px-3 py-2 dark:border-white/15 dark:bg-[#1e2a3c]">
        {isDm ? (
          <Avatar name={roomName} src={peerAvatar ?? null} size={56} presence={status} className="rounded-sm" />
        ) : (
          <div className="grid h-14 w-14 place-items-center rounded-sm border border-[#7f9db9] bg-gradient-to-br from-[#5eb1ef] to-[#0d5aa8] text-2xl text-white">
            {roomEmoji}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] font-bold text-[#0a246a] dark:text-white">
            {roomName}
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-[#444] dark:text-sage-400">
            <MsnPresenceIcon status={isDm ? status : online > 0 ? "online" : "offline"} size={12} />
            {isDm ? (
              <>
                {presenceLabel(status)}
                {peerStatusMessage ? ` — ${peerStatusMessage}` : description ? ` · ${description}` : ""}
              </>
            ) : (
              <>
                {online} online · {memberCount} members
                {description ? ` · ${description}` : ""}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Message history — classic “Name says:” */}
      <div ref={scrollRef} className="msn-inset m-1.5 min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-[12px] italic text-[#666] dark:text-sage-400">
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
                  "text-center text-[12px] italic text-[#6b4a00] dark:text-amber-200/90",
                  m.failed && "text-rose-600"
                )}
              >
                * {nudgeSystemLine(m.mine ? roomName : m.sender.name, m.mine)}
                <span className="ml-2 not-italic text-[10px] text-[#888]">
                  {m.pending ? "Sending…" : m.failed ? "Failed" : timeAgo(m.createdAt)}
                </span>
              </p>
            );
          }

          const nameColor = m.mine ? "#0a5a9c" : "#8b1a1a";
          return (
            <div key={m.id} className={cn("msn-says", m.pending && "opacity-70", m.failed && "opacity-90")}>
              <p>
                <span className="msn-says-name" style={{ color: nameColor }}>
                  {m.mine ? "You" : m.sender.name}
                </span>
                <span className="msn-says-name" style={{ color: nameColor }}>
                  {" "}
                  says:
                </span>
              </p>
              <p
                className={cn(
                  "whitespace-pre-wrap break-words pl-1 text-[13px]",
                  m.failed ? "text-rose-700 dark:text-rose-300" : "text-[#1a1a1a] dark:text-sage-100"
                )}
              >
                {m.content}
              </p>
              <p className="pl-1 text-[10px] text-[#888]">
                {m.failed ? "Failed to send" : m.pending ? "Sending…" : timeAgo(m.createdAt)}
              </p>
            </div>
          );
        })}
      </div>

      {sendError && (
        <p className="px-2 text-[11px] text-rose-600" role="alert">
          {sendError}
        </p>
      )}

      <div className="msn-composer">
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
          placeholder="Type a message…"
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

      <div className="msn-statusbar min-h-[1.5rem]">
        {typingLine ? (
          <span className="italic">{typingLine}</span>
        ) : (
          <span>
            {isDm
              ? `${roomName} is ${presenceLabel(status).toLowerCase()}`
              : `${online} people online in this room`}
          </span>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Circle } from "lucide-react";
import { Avatar } from "./ui/avatar";
import { timeAgo } from "@/lib/utils";

type Msg = {
  id: string;
  content: string;
  createdAt: string;
  mine: boolean;
  sender: { id: string; name: string; avatarUrl: string | null; presence: string };
};

export function ChatWindow({
  roomId,
  roomName,
  roomEmoji,
  description,
}: {
  roomId: string;
  roomName: string;
  roomEmoji: string;
  description?: string | null;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState<string[]>([]);
  const [online, setOnline] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTypingSent = useRef(0);
  const initialised = useRef(false);

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    });
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${roomId}/messages`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setMessages((prev) => {
        const grew = data.messages.length !== prev.length;
        if (grew) {
          const wasAtBottom =
            !scrollRef.current ||
            scrollRef.current.scrollHeight -
              scrollRef.current.scrollTop -
              scrollRef.current.clientHeight <
              120;
          if (wasAtBottom || !initialised.current) scrollToBottom(initialised.current);
        }
        return data.messages;
      });
      setTyping(data.typing || []);
      setOnline(data.online || 0);
      setMemberCount(data.memberCount || 0);
      initialised.current = true;
    } catch {
      /* ignore network blips */
    }
  }, [roomId, scrollToBottom]);

  useEffect(() => {
    initialised.current = false;
    setMessages([]);
    load();
    const id = setInterval(load, 2500);
    return () => clearInterval(id);
  }, [load]);

  function onType(value: string) {
    setInput(value);
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
    setInput("");
    // optimistic
    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      mine: true,
      sender: { id: "me", name: "You", avatarUrl: null, presence: "online" },
    };
    setMessages((m) => [...m, optimistic]);
    scrollToBottom();
    try {
      await fetch(`/api/chat/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      await load();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* MSN-style header */}
      <div className="glass-strong flex items-center gap-3 rounded-t-3xl border-b border-white/40 dark:border-white/10 px-5 py-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-sage-500 text-xl">
          {roomEmoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-sage-900 dark:text-white">{roomName}</p>
          <p className="flex items-center gap-1.5 text-xs text-sage-500 dark:text-sage-400">
            <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
            {online} online · {memberCount} members
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="glass flex-1 space-y-3 overflow-y-auto border-x border-white/40 dark:border-white/10 px-4 py-5"
      >
        {messages.length === 0 && (
          <p className="mt-10 text-center text-sm text-sage-400">
            No messages yet. Say hello 👋
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2.5 ${m.mine ? "flex-row-reverse" : ""}`}>
            {!m.mine && <Avatar name={m.sender.name} src={m.sender.avatarUrl} size={32} presence={m.sender.presence} />}
            <div className={`max-w-[75%] ${m.mine ? "items-end" : "items-start"} flex flex-col`}>
              {!m.mine && <span className="mb-0.5 px-1 text-xs font-medium text-sage-500">{m.sender.name}</span>}
              <div
                className={`rounded-2xl px-3.5 py-2 text-sm shadow-soft ${
                  m.mine
                    ? "rounded-br-md bg-brand-600 text-white"
                    : "rounded-bl-md bg-white/80 dark:bg-white/10 text-sage-800 dark:text-sage-100"
                }`}
              >
                {m.content}
              </div>
              <span className="mt-0.5 px-1 text-[10px] text-sage-400">{timeAgo(m.createdAt)}</span>
            </div>
          </div>
        ))}
        {typing.length > 0 && (
          <div className="flex items-center gap-2 px-1 text-xs italic text-sage-500">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-sage-400" />
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-sage-400 [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-sage-400 [animation-delay:0.4s]" />
            </span>
            {typing.slice(0, 2).join(", ")} {typing.length === 1 ? "is" : "are"} typing…
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="glass-strong flex items-center gap-2 rounded-b-3xl border-t border-white/40 dark:border-white/10 px-3 py-3">
        <input
          value={input}
          onChange={(e) => onType(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={`Message ${roomName}…`}
          className="input flex-1"
        />
        <button onClick={send} disabled={sending || !input.trim()} className="btn-primary px-4">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { MsnPresenceIcon } from "@/components/msn-presence-icon";
import { cn } from "@/lib/utils";

type Msg = { name: string; text: string };

export function HeroMessenger({
  onlineCount,
  messages,
  className,
}: {
  onlineCount: number;
  messages: Msg[];
  className?: string;
}) {
  const [visible, setVisible] = useState(0);
  const [typing, setTyping] = useState(true);

  const lines = useMemo(
    () => messages.filter((m) => m.name.trim() && m.text.trim()),
    [messages]
  );
  const linesKey = useMemo(
    () => lines.map((m) => `${m.name}:${m.text}`).join("|"),
    [lines]
  );

  useEffect(() => {
    setVisible(0);
    setTyping(true);
    if (lines.length === 0) {
      setTyping(false);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    lines.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisible(i + 1);
          if (i === lines.length - 1) setTyping(false);
        }, 700 + i * 950)
      );
    });
    return () => timers.forEach(clearTimeout);
    // Restart only when the message content actually changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linesKey]);

  const shown = lines.slice(0, visible);
  const awaitingMore = typing && visible < lines.length;

  return (
    <div
      className={cn(
        "w-full animate-fade-in [animation-delay:120ms]",
        className
      )}
    >
      <div className="msn-window msn-window-hero">
        <div className="msn-titlebar">
          <MsnPresenceIcon status="online" size={14} />
          <span className="min-w-0 flex-1 truncate text-[12px] font-semibold tracking-wide">
            Safely Messenger — Instant Message
          </span>
          <span className="hidden text-[10px] text-white/80 sm:inline">
            General Support
          </span>
          <span className="msn-titlebar-btn" aria-hidden>
            _
          </span>
          <span className="msn-titlebar-btn" aria-hidden>
            ×
          </span>
        </div>

        <div className="msn-menubar">
          <button type="button" tabIndex={-1}>
            File
          </button>
          <button type="button" tabIndex={-1}>
            Edit
          </button>
          <button type="button" tabIndex={-1}>
            Actions
          </button>
          <button type="button" tabIndex={-1}>
            Tools
          </button>
          <button type="button" tabIndex={-1}>
            Help
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-[#c5c2b2]/80 bg-gradient-to-b from-[#faf9f4] to-[#f0efe6] px-3 py-2.5 dark:border-white/10 dark:from-[#243044] dark:to-[#1c2636]">
          <div className="grid h-12 w-12 place-items-center rounded-md border border-[#7f9db9]/70 bg-gradient-to-br from-[#5eb1ef] via-[#1a7fd4] to-[#0d5aa8] text-xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_4px_12px_-4px_rgba(13,90,168,0.55)]">
            💬
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-semibold tracking-tight text-[#0a246a] dark:text-white">
              General Support
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#555] dark:text-sage-400">
              <MsnPresenceIcon status="online" size={11} />
              {onlineCount} online · Safely Lounge
            </p>
          </div>
        </div>

        <div className="msn-inset m-2 flex min-h-[260px] flex-col gap-3 p-3.5 sm:min-h-[300px]">
          {shown.map((m, i) => {
            const mine = m.name === "You";
            return (
              <div
                key={`${m.name}-${m.text.slice(0, 24)}-${i}`}
                className="msn-says animate-fade-in"
              >
                <p>
                  <span
                    className="msn-says-name"
                    style={{ color: mine ? "#0a5a9c" : "#8b1a1a" }}
                  >
                    {m.name} says:
                  </span>
                </p>
                <p className="pl-0.5 text-[13.5px] leading-relaxed text-[#1a1a1a] dark:text-sage-100">
                  {m.text}
                </p>
              </div>
            );
          })}

          {awaitingMore && (
            <p className="text-[11px] italic text-[#666] dark:text-sage-400">
              Someone is typing a message…
            </p>
          )}
        </div>

        <div className="msn-composer">
          <button type="button" className="msn-nudge-btn" tabIndex={-1}>
            Nudge!
          </button>
          <div className="msn-input flex-1 text-[#888]">
            Message General Support…
          </div>
          <button type="button" className="msn-send" tabIndex={-1}>
            Send
          </button>
        </div>

        <div className="msn-statusbar">
          {awaitingMore ? (
            <span className="italic">Someone is typing a message…</span>
          ) : (
            <span>{onlineCount} people online</span>
          )}
        </div>
      </div>
    </div>
  );
}

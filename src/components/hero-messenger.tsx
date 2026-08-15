"use client";

import { useEffect, useState } from "react";
import { MsnPresenceIcon } from "@/components/msn-presence-icon";
import { cn } from "@/lib/utils";

type Msg = { name: string; text: string };

export function HeroMessenger({
  onlineCount,
  messages,
}: {
  onlineCount: number;
  messages: Msg[];
}) {
  const [visible, setVisible] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    setVisible(0);
    setTyping(true);
    const timers: ReturnType<typeof setTimeout>[] = [];
    messages.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisible(i + 1);
          if (i === messages.length - 1) setTyping(false);
        }, 600 + i * 900)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [messages]);

  return (
    <div className="w-full max-w-lg animate-fade-in [animation-delay:120ms] lg:ml-auto">
      <div className="msn-window shadow-[0_24px_80px_-20px_rgba(0,0,0,0.45)]">
        <div className="msn-titlebar">
          <MsnPresenceIcon status="online" size={14} />
          <span className="min-w-0 flex-1 truncate text-[12px] font-semibold tracking-wide">
            Safely Messenger — Instant Message
          </span>
          <span className="text-[10px] text-white/80">General Support</span>
          <span className="msn-titlebar-btn" aria-hidden>
            _
          </span>
          <span className="msn-titlebar-btn" aria-hidden>
            ×
          </span>
        </div>

        <div className="msn-menubar">
          <button type="button">File</button>
          <button type="button">Edit</button>
          <button type="button">Actions</button>
          <button type="button">Tools</button>
          <button type="button">Help</button>
        </div>

        <div className="flex items-center gap-3 border-b border-[#a0a0a0] bg-[#f5f4ec] px-3 py-2 dark:border-white/15 dark:bg-[#1e2a3c]">
          <div className="grid h-12 w-12 place-items-center rounded-sm border border-[#7f9db9] bg-gradient-to-br from-[#5eb1ef] to-[#0d5aa8] text-xl text-white">
            💬
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-bold text-[#0a246a] dark:text-white">
              General Support
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-[#444] dark:text-sage-400">
              <MsnPresenceIcon status="online" size={12} />
              {onlineCount} online
            </p>
          </div>
        </div>

        <div className="msn-inset m-1.5 flex min-h-[260px] flex-col gap-2.5 p-3 sm:min-h-[300px]">
          {messages.slice(0, visible).map((m, i) => {
            const mine = i === messages.length - 1 && visible === messages.length;
            return (
              <div key={`${m.name}-${i}`} className={cn("msn-says animate-fade-in")}>
                <p>
                  <span
                    className="msn-says-name"
                    style={{ color: mine ? "#0a5a9c" : "#8b1a1a" }}
                  >
                    {mine ? "You" : m.name} says:
                  </span>
                </p>
                <p className="pl-1 text-[13px] text-[#1a1a1a] dark:text-sage-100">{m.text}</p>
              </div>
            );
          })}

          {typing && visible < messages.length && (
            <p className="text-[11px] italic text-[#666] dark:text-sage-400">
              Someone is typing a message…
            </p>
          )}
        </div>

        <div className="msn-composer">
          <button type="button" className="msn-nudge-btn" tabIndex={-1}>
            Nudge!
          </button>
          <div className="msn-input flex-1 text-[#888]">Message General Support…</div>
          <button type="button" className="msn-send" tabIndex={-1}>
            Send
          </button>
        </div>

        <div className="msn-statusbar">
          {typing && visible < messages.length ? (
            <span className="italic">Someone is typing a message…</span>
          ) : (
            <span>{onlineCount} people online</span>
          )}
        </div>
      </div>
    </div>
  );
}

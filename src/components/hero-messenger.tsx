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
      <div className="overflow-hidden rounded-[1.75rem] border border-white/50 bg-gradient-to-b from-white/90 to-white/70 shadow-glass-lg backdrop-blur-xl dark:border-white/15 dark:from-white/[0.10] dark:to-white/[0.04]">
        <div className="flex items-center gap-2 border-b border-sage-200/60 px-4 py-3 dark:border-white/10">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-safely-gradient text-sm text-white">
            💬
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold text-sage-900 dark:text-white">
              General Support
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-sage-500">
              <MsnPresenceIcon status="online" size={10} />
              {onlineCount} online · Safely Messenger
            </p>
          </div>
        </div>

        <div className="flex min-h-[260px] flex-col gap-2.5 px-4 py-4 sm:min-h-[300px]">
          {messages.slice(0, visible).map((m, i) => (
            <div
              key={`${m.name}-${i}`}
              className={cn(
                "max-w-[90%] animate-fade-in rounded-2xl px-3 py-2",
                m.name === "You"
                  ? "ml-auto bg-brand-500/15"
                  : "bg-white/80 dark:bg-white/[0.06]"
              )}
            >
              {m.name !== "You" && (
                <p className="text-[11px] font-semibold text-brand-700 dark:text-brand-300">
                  {m.name}
                </p>
              )}
              <p className="text-[13px] leading-relaxed text-sage-800 dark:text-sage-100">
                {m.text}
              </p>
            </div>
          ))}
          {typing && (
            <p className="text-xs italic text-sage-400">Someone is typing…</p>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-sage-200/50 bg-white/40 p-3 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex-1 rounded-2xl border border-sage-200/70 bg-white/90 px-3 py-2 text-[13px] text-sage-400 dark:border-white/15 dark:bg-black/25">
            Message General Support…
          </div>
          <button type="button" className="msn-send" tabIndex={-1}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

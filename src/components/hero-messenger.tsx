"use client";

import { useEffect, useState } from "react";
import { Circle } from "lucide-react";
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
      {/* MSN window chrome — full-bleed plane, not a floating marketing card */}
      <div className="overflow-hidden rounded-t-2xl border border-white/25 bg-white/95 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl dark:bg-[#121a28]/95">
        <div
          className="flex items-center gap-2 px-4 py-2.5 text-white"
          style={{
            background: "linear-gradient(180deg, #4a90e2 0%, #2b6cb0 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
          }}
        >
          <span className="font-display text-sm font-semibold tracking-wide">
            Amity Messenger
          </span>
          <span className="ml-auto text-xs text-white/80">General Support</span>
        </div>

        <div className="flex items-center gap-3 border-b border-sage-200/60 px-4 py-3 dark:border-white/10">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-teal-500 text-lg text-white">
            💬
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-sage-900 dark:text-white">
              General Support
            </p>
            <p className="flex items-center gap-1.5 text-xs text-sage-500">
              <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
              {onlineCount} online
              {typing && (
                <span className="ml-1 italic text-sage-400">· someone is typing…</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex min-h-[280px] flex-col gap-3 px-4 py-5 sm:min-h-[320px]">
          {messages.slice(0, visible).map((m, i) => {
            const mine = i === messages.length - 1 && visible === messages.length;
            return (
              <div
                key={`${m.name}-${i}`}
                className={cn(
                  "flex flex-col animate-fade-in",
                  mine ? "items-end" : "items-start"
                )}
              >
                {!mine && (
                  <span className="mb-0.5 px-1 text-xs font-medium text-sage-500">
                    {m.name}
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl px-3.5 py-2 text-sm shadow-soft",
                    mine
                      ? "rounded-br-md bg-brand-600 text-white"
                      : "rounded-bl-md bg-sage-100 text-sage-800 dark:bg-white/10 dark:text-sage-100"
                  )}
                >
                  {m.text}
                </div>
              </div>
            );
          })}

          {typing && visible < messages.length && (
            <div className="flex items-center gap-2 px-1 text-xs text-sage-400">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-sage-400" />
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-sage-400 [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-sage-400 [animation-delay:0.4s]" />
              </span>
              typing…
            </div>
          )}
        </div>

        <div className="border-t border-sage-200/60 px-3 py-3 dark:border-white/10">
          <div className="flex items-center gap-2 rounded-xl bg-sage-50 px-3 py-2.5 text-sm text-sage-400 dark:bg-white/5">
            Message General Support…
            <span className="ml-auto rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
              Send
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

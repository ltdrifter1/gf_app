"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type SurfRoom = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string;
  online: number;
  unreadCount?: number;
  lastMessage: { text: string; sender: string; at: string } | null;
};

function surfLine(r: SurfRoom) {
  if (r.online > 0) return `${r.online} live`;
  if (r.lastMessage) return `${r.lastMessage.sender}: ${r.lastMessage.text}`;
  return r.description ?? "Quiet for now";
}

/** Premium horizontal channel ticker — sits at the top of the main Messenger pane. */
export function ChannelSurfingTicker({
  rooms,
  activeSlug,
  className,
}: {
  rooms: SurfRoom[];
  activeSlug?: string;
  className?: string;
}) {
  if (rooms.length === 0) return null;

  const ranked = [...rooms].sort((a, b) => {
    if ((b.online ?? 0) !== (a.online ?? 0)) return (b.online ?? 0) - (a.online ?? 0);
    return (b.lastMessage?.at ?? "").localeCompare(a.lastMessage?.at ?? "");
  });

  const marqueeItems = ranked.flatMap((r) => [
    { key: `${r.id}-name`, room: r, kind: "name" as const },
    { key: `${r.id}-line`, room: r, kind: "line" as const },
  ]);

  // Duplicate for seamless CSS loop
  const loop = [...marqueeItems, ...marqueeItems];

  return (
    <div
      className={cn(
        "channel-surf relative shrink-0 overflow-hidden border-b border-sage-200/50 dark:border-white/10",
        className
      )}
      role="navigation"
      aria-label="Channel surfing"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-500/[0.07] via-transparent to-accent-400/[0.08]" />

      <div className="relative flex items-stretch">
        <div className="relative z-10 flex shrink-0 items-center gap-2 border-r border-sage-200/50 bg-white/55 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-black/30">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
          </span>
          <span className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-sage-600 dark:text-sage-300">
            Channel surfing
          </span>
        </div>

        <div className="min-w-0 flex-1">
          {/* Clickable channel rail */}
          <div className="flex gap-1.5 overflow-x-auto px-2.5 pt-2 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {ranked.map((r) => {
              const active = activeSlug === r.slug;
              return (
                <Link
                  key={r.id}
                  href={`/app/chat/${r.slug}`}
                  className={cn(
                    "group inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition",
                    active
                      ? "bg-safely-gradient text-white shadow-glow"
                      : "bg-white/70 text-sage-700 ring-1 ring-sage-200/60 hover:bg-white hover:ring-brand-300/50 dark:bg-white/[0.06] dark:text-sage-200 dark:ring-white/10 dark:hover:bg-white/[0.1]"
                  )}
                >
                  <span className="text-[12px] leading-none">{r.emoji}</span>
                  <span className="max-w-[7.5rem] truncate">{r.name}</span>
                  {r.online > 0 && (
                    <span
                      className={cn(
                        "tabular-nums",
                        active ? "text-white/85" : "text-brand-600 dark:text-brand-300"
                      )}
                    >
                      {r.online}
                    </span>
                  )}
                  {(r.unreadCount ?? 0) > 0 && !active && (
                    <span className="inline-flex min-w-[1rem] justify-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white">
                      {r.unreadCount! > 99 ? "99+" : r.unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Live activity marquee */}
          <div className="channel-surf-mask relative overflow-hidden py-1.5">
            <div className="channel-surf-track flex w-max gap-6 whitespace-nowrap px-3 text-[11px] text-sage-500 dark:text-sage-400">
              {loop.map((item) =>
                item.kind === "name" ? (
                  <Link
                    key={item.key + "-a"}
                    href={`/app/chat/${item.room.slug}`}
                    className="inline-flex items-center gap-1.5 font-medium text-sage-700 transition hover:text-brand-700 dark:text-sage-200 dark:hover:text-brand-300"
                  >
                    <span aria-hidden>{item.room.emoji}</span>
                    {item.room.name}
                  </Link>
                ) : (
                  <span key={item.key + "-b"} className="inline-flex items-center gap-1.5">
                    <span className="text-sage-300 dark:text-white/20" aria-hidden>
                      ·
                    </span>
                    <span className="max-w-[18rem] truncate italic">{surfLine(item.room)}</span>
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

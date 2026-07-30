import Link from "next/link";
import { Crown } from "lucide-react";
import { timeAgo } from "@/lib/utils";

type Room = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string;
  isPremium?: boolean;
  members: number;
  online: number;
  lastMessage: { text: string; sender: string; at: string } | null;
};

export function RoomsList({ rooms, activeSlug }: { rooms: Room[]; activeSlug?: string }) {
  return (
    <div className="space-y-1.5">
      {rooms.map((r) => (
        <Link
          key={r.id}
          href={`/app/chat/${r.slug}`}
          className={`flex items-center gap-3 rounded-2xl p-2.5 transition ${
            activeSlug === r.slug
              ? "bg-brand-50 dark:bg-brand-500/15"
              : "hover:bg-sage-100/60 dark:hover:bg-white/5"
          }`}
        >
          <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-sage-500 text-lg">
            {r.emoji}
            {r.online > 0 && (
              <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#0e1512]">
                {r.online}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate font-medium text-sage-900 dark:text-white">
              {r.name}
              {r.isPremium && <Crown className="h-3.5 w-3.5 shrink-0 text-warm-500" />}
            </p>
            <p className="truncate text-xs text-sage-500 dark:text-sage-400">
              {r.lastMessage
                ? `${r.lastMessage.sender}: ${r.lastMessage.text}`
                : r.description}
            </p>
          </div>
          {r.lastMessage && (
            <span className="shrink-0 text-[10px] text-sage-400">
              {timeAgo(r.lastMessage.at)}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { BuddyList, type MsnContact } from "@/components/buddy-list";
import { RoomsList } from "@/components/rooms-list";
import { MsnMeStrip } from "@/components/msn-me-strip";
import { MsnPrefsControls } from "@/components/msn-prefs-controls";
import { cn } from "@/lib/utils";

type Room = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string;
  members: number;
  online: number;
  unreadCount?: number;
  lastMessage: { text: string; sender: string; at: string } | null;
};

type Me = {
  name: string;
  username: string;
  avatarUrl: string | null;
  presence: string;
  statusMessage: string | null;
};

export function ContactListPane({
  onlineCount,
  online,
  offline,
  rooms,
  me,
  activeSlug,
  className,
  embedded = false,
}: {
  onlineCount: number;
  online: MsnContact[];
  offline: MsnContact[];
  rooms: Room[];
  me: Me;
  activeSlug?: string;
  className?: string;
  /** When true, pane is a column inside MessengerShell (no outer card). */
  embedded?: boolean;
}) {
  const [query, setQuery] = useState("");

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col bg-gradient-to-b from-white/50 to-transparent dark:from-white/[0.03]",
        !embedded && "msn-window msn-window-hero msn-window-fill",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#94a3b8]/40 px-3 py-2.5 dark:border-white/10">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#0a3a6e] dark:text-white">
            Contacts
          </p>
          <p className="text-[11px] text-[#64748b] dark:text-sage-400">
            {onlineCount} online
          </p>
        </div>
        <Link
          href="/app/search"
          className="grid h-8 w-8 place-items-center rounded-lg border border-[#94a3b8]/45 bg-white/70 text-[#0a3a6e] transition hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-sage-100"
          title="Find people"
          aria-label="Find people"
        >
          <UserPlus className="h-4 w-4" />
        </Link>
      </div>

      <MsnMeStrip me={me} />

      <div className="px-2.5 py-2">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
          <input
            id="msn-contact-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts & rooms…"
            className="msn-input w-full py-2 pl-8 text-[12.5px]"
            aria-label="Search contacts and rooms"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
        <BuddyList online={online} offline={offline} activeSlug={activeSlug} query={query} />

        <div className="mt-3 border-t border-[#94a3b8]/35 pt-2 dark:border-white/10">
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748b]">
            Community rooms
          </p>
          <RoomsList rooms={rooms} activeSlug={activeSlug} query={query} />
        </div>
      </div>

      <div className="border-t border-[#94a3b8]/35 px-2 py-1.5 dark:border-white/10">
        <MsnPrefsControls />
      </div>
    </div>
  );
}

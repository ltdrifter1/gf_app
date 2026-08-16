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
    <div className={cn("flex h-full min-h-0 flex-col", !embedded && "msn-window msn-window-fill", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-sage-200/60 px-4 py-3 dark:border-white/10">
        <div className="min-w-0">
          <p className="font-display text-base font-semibold text-sage-900 dark:text-white">
            Messenger
          </p>
          <p className="text-xs text-sage-500">
            {onlineCount} online
          </p>
        </div>
        <Link
          href="/app/search"
          className="btn-ghost rounded-full p-2"
          title="Find people"
          aria-label="Find people"
        >
          <UserPlus className="h-4 w-4" />
        </Link>
      </div>

      <MsnMeStrip me={me} />

      <div className="px-3 py-2">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sage-400" />
          <input
            id="msn-contact-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts & rooms…"
            className="msn-input w-full py-2 pl-9 text-[13px]"
            aria-label="Search contacts and rooms"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <BuddyList online={online} offline={offline} activeSlug={activeSlug} query={query} />

        <div className="mt-3 border-t border-sage-200/50 pt-2 dark:border-white/10">
          <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-sage-500">
            Community rooms
          </p>
          <RoomsList rooms={rooms} activeSlug={activeSlug} query={query} />
        </div>
      </div>

      <div className="border-t border-sage-200/50 px-2 py-1.5 dark:border-white/10">
        <MsnPrefsControls />
      </div>
    </div>
  );
}

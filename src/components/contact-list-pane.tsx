"use client";

import { useState } from "react";
import Link from "next/link";
import { BuddyList, type MsnContact } from "@/components/buddy-list";
import { RoomsList } from "@/components/rooms-list";
import { MsnMeStrip } from "@/components/msn-me-strip";
import { MsnPrefsControls } from "@/components/msn-prefs-controls";
import { MsnPresenceIcon } from "@/components/msn-presence-icon";
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
}: {
  onlineCount: number;
  online: MsnContact[];
  offline: MsnContact[];
  rooms: Room[];
  me: Me;
  activeSlug?: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");

  return (
    <div className={cn("msn-window msn-window-fill", className)}>
      <div className="msn-titlebar">
        <MsnPresenceIcon status="online" size={14} />
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold tracking-wide">
          Safely Messenger — Contact List
        </span>
        <span className="text-[10px] text-white/85">{onlineCount} online</span>
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
        <Link href="/app/search">Add a Contact</Link>
        <button type="button" onClick={() => document.getElementById("msn-contact-search")?.focus()}>
          Find
        </button>
      </div>

      <MsnMeStrip me={me} />

      <div className="border-b border-[#a0a0a0] bg-[#ece9d8] px-2 py-1.5 dark:border-white/15 dark:bg-[#243044]">
        <input
          id="msn-contact-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search contacts…"
          className="msn-input w-full py-1 text-[12px]"
          aria-label="Search contacts"
        />
      </div>

      <div className="msn-inset m-1.5 min-h-0 flex-1 overflow-y-auto p-1">
        <BuddyList online={online} offline={offline} activeSlug={activeSlug} query={query} />

        <div className="mt-3 border-t border-[#c0c0c0] pt-2 dark:border-white/10">
          <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-wide text-[#555] dark:text-sage-400">
            Community rooms
          </p>
          <RoomsList rooms={rooms} activeSlug={activeSlug} query={query} />
        </div>
      </div>

      <MsnPrefsControls />
      <div className="msn-statusbar">
        <MsnPresenceIcon status="online" size={12} />
        <span>Signed in as {me.name}</span>
      </div>
    </div>
  );
}

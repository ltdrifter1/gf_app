"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Avatar } from "./ui/avatar";
import { MsnPresenceIcon } from "./msn-presence-icon";
import { setPresence, updateStatusMessage } from "@/lib/actions/profile";
import { presenceLabel } from "@/lib/presence";

type Me = {
  name: string;
  username: string;
  avatarUrl: string | null;
  presence: string;
  statusMessage: string | null;
};

export function MsnMeStrip({ me }: { me: Me }) {
  const [presence, setPresenceLocal] = useState(me.presence || "online");
  const [status, setStatus] = useState(me.statusMessage ?? "");
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  function changePresence(next: "online" | "away" | "offline") {
    setPresenceLocal(next);
    start(async () => {
      await setPresence(next);
    });
  }

  function saveStatus() {
    setEditing(false);
    start(async () => {
      await updateStatusMessage(status);
    });
  }

  const statusKey = (presence === "away" || presence === "offline" ? presence : "online") as
    | "online"
    | "away"
    | "offline";

  return (
    <div className="flex items-start gap-2.5 border-b border-[#a0a0a0] bg-[#f5f4ec] px-2.5 py-2 dark:border-white/15 dark:bg-[#1e2a3c]">
      <Avatar
        name={me.name}
        src={me.avatarUrl}
        size={48}
        presence={statusKey}
        className="rounded-sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <MsnPresenceIcon status={statusKey} size={13} />
          <p className="truncate text-[13px] font-bold text-[#0a246a] dark:text-white">{me.name}</p>
        </div>
        <label className="mt-0.5 flex items-center gap-1 text-[11px] text-[#444] dark:text-sage-400">
          <span className="sr-only">Presence</span>
          <select
            value={statusKey}
            disabled={pending}
            onChange={(e) => changePresence(e.target.value as "online" | "away" | "offline")}
            className="max-w-full rounded-sm border border-[#7f9db9] bg-white px-1 py-0.5 text-[11px] text-[#1a1a1a] outline-none focus:border-[#0268c8] dark:border-white/20 dark:bg-[#121a28] dark:text-sage-100"
            aria-label="Your presence"
          >
            <option value="online">{presenceLabel("online")}</option>
            <option value="away">{presenceLabel("away")}</option>
            <option value="offline">Appear offline</option>
          </select>
        </label>
        {editing ? (
          <input
            autoFocus
            value={status}
            maxLength={80}
            onChange={(e) => setStatus(e.target.value)}
            onBlur={saveStatus}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                saveStatus();
              }
              if (e.key === "Escape") {
                setStatus(me.statusMessage ?? "");
                setEditing(false);
              }
            }}
            placeholder="What are you up to?"
            className="mt-1 w-full border border-[#7f9db9] bg-white px-1.5 py-0.5 text-[11px] italic text-[#1a1a1a] outline-none focus:border-[#0268c8] dark:border-white/20 dark:bg-[#121a28] dark:text-sage-100"
            aria-label="Status message"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-0.5 block w-full truncate text-left text-[11px] italic text-[#555] hover:text-[#316ac5] dark:text-sage-400 dark:hover:text-brand-300"
            title="Click to edit status"
          >
            {status.trim() || "Click to set a status message…"}
          </button>
        )}
        <Link
          href={`/app/u/${me.username}`}
          className="mt-0.5 inline-block text-[10px] text-[#316ac5] hover:underline dark:text-brand-300"
        >
          @{me.username}
        </Link>
      </div>
    </div>
  );
}

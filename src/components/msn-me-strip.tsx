"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Avatar } from "./ui/avatar";
import { MsnPresenceIcon } from "./msn-presence-icon";
import { setPresence, updateStatusMessage } from "@/lib/actions/profile";
import { PRESENCE_STATUSES, type PresenceSlug } from "@/lib/presence";
import { RecoveryLauncher } from "./recovery-card";
import { FindBuddyButton } from "./find-buddy-button";

type Me = {
  name: string;
  username: string;
  avatarUrl: string | null;
  presence: string;
  statusMessage: string | null;
};

type BuddyOption = { id: string; name: string };

export function MsnMeStrip({
  me,
  buddies = [],
  panicBuddyId = null,
}: {
  me: Me;
  buddies?: BuddyOption[];
  panicBuddyId?: string | null;
}) {
  const [presence, setPresenceLocal] = useState(me.presence || "online");
  const [status, setStatus] = useState(me.statusMessage ?? "");
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  function changePresence(next: PresenceSlug) {
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

  return (
    <div className="flex items-start gap-3 border-b border-sage-200/60 bg-white/30 px-3 py-3 dark:border-white/10 dark:bg-white/[0.03]">
      <Avatar
        name={me.name}
        src={me.avatarUrl}
        size={48}
        presence={presence}
        className="rounded-2xl"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <MsnPresenceIcon status={presence} size={13} />
          <p className="truncate text-sm font-semibold text-sage-900 dark:text-white">{me.name}</p>
        </div>
        <label className="mt-1 flex items-center gap-1 text-xs text-sage-500">
          <span className="sr-only">Presence</span>
          <select
            value={presence}
            disabled={pending}
            onChange={(e) => changePresence(e.target.value as PresenceSlug)}
            className="max-w-full rounded-full border border-sage-200/70 bg-white/80 px-2 py-0.5 text-xs text-sage-800 outline-none focus:border-brand-400 dark:border-white/15 dark:bg-black/30 dark:text-sage-100"
            aria-label="Your presence"
          >
            {PRESENCE_STATUSES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
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
            className="mt-1.5 w-full rounded-xl border border-sage-200/70 bg-white/90 px-2 py-1 text-xs italic text-sage-800 outline-none focus:border-brand-400 dark:border-white/15 dark:bg-black/30 dark:text-sage-100"
            aria-label="Status message"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-1 block w-full truncate text-left text-xs italic text-sage-500 hover:text-brand-600 dark:hover:text-brand-300"
            title="Click to edit status"
          >
            {status.trim() || "Click to set a status message…"}
          </button>
        )}
        <div className="mt-2 flex flex-wrap gap-1">
          <FindBuddyButton compact />
          <RecoveryLauncher compact buddies={buddies} panicBuddyId={panicBuddyId} />
        </div>
        <Link
          href={`/app/u/${me.username}`}
          className="mt-0.5 inline-block text-[11px] font-medium text-brand-600 hover:underline dark:text-brand-300"
        >
          @{me.username}
        </Link>
      </div>
    </div>
  );
}

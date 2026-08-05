"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MsnPresenceIcon } from "./msn-presence-icon";
import { getOrCreateDm } from "@/lib/actions/chat";
import { presenceLabel } from "@/lib/presence";
import { cn } from "@/lib/utils";

export type MsnContact = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  presence: "online" | "away" | "offline" | string;
  statusMessage: string | null;
};

function isRedirectError(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: string }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

function Group({
  title,
  contacts,
  defaultOpen = true,
  onMessage,
}: {
  title: string;
  contacts: MsnContact[];
  defaultOpen?: boolean;
  onMessage: (id: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-0.5">
      <button type="button" className="msn-group-header" onClick={() => setOpen((v) => !v)}>
        <span className="inline-block w-3 text-[10px]">{open ? "▾" : "▸"}</span>
        {title} ({contacts.length})
      </button>
      {open &&
        (contacts.length === 0 ? (
          <p className="px-4 py-1 text-[11px] italic text-[#666] dark:text-sage-400">
            No contacts here
          </p>
        ) : (
          contacts.map((c) => {
            const status = (c.presence || "offline") as "online" | "away" | "offline";
            return (
              <button
                key={c.id}
                type="button"
                className="msn-contact"
                onClick={() => onMessage(c.id)}
                title={`Message ${c.name}`}
              >
                <MsnPresenceIcon status={status} size={16} className="mt-0.5" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {c.name}{" "}
                    <span className="font-normal opacity-80">({presenceLabel(status)})</span>
                  </span>
                  {c.statusMessage && (
                    <span className="block truncate text-[11px] italic opacity-80">
                      {c.statusMessage}
                    </span>
                  )}
                </span>
              </button>
            );
          })
        ))}
    </div>
  );
}

export function BuddyList({
  online,
  offline,
  className,
}: {
  online: MsnContact[];
  offline: MsnContact[];
  className?: string;
}) {
  const [pending, start] = useTransition();

  function message(userId: string) {
    if (pending) return;
    start(async () => {
      try {
        await getOrCreateDm(userId);
      } catch (err) {
        if (isRedirectError(err)) throw err;
      }
    });
  }

  return (
    <div className={cn("select-none", className)}>
      <Group title="Online" contacts={online} defaultOpen onMessage={message} />
      <Group
        title="Offline"
        contacts={offline}
        defaultOpen={offline.length > 0 && offline.length <= 12}
        onMessage={message}
      />
      <p className="mt-2 px-1 text-[10px] text-[#666] dark:text-sage-500">
        Set your status on{" "}
        <Link href="/app/profile" className="underline hover:text-[#316ac5]">
          your profile
        </Link>
        .
      </p>
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MsnPresenceIcon } from "./msn-presence-icon";
import { getOrCreateDm } from "@/lib/actions/chat";
import { presenceLabel } from "@/lib/presence";
import { timeAgo, cn } from "@/lib/utils";

export type MsnContact = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  presence: "online" | "away" | "offline" | string;
  statusMessage: string | null;
  dmSlug?: string | null;
  unreadCount?: number;
  lastMessage?: { text: string; sender: string; at: string } | null;
  isFavorite?: boolean;
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
  activeSlug,
  onMessage,
}: {
  title: string;
  contacts: MsnContact[];
  defaultOpen?: boolean;
  activeSlug?: string;
  onMessage: (c: MsnContact) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (contacts.length === 0 && title !== "Online" && title !== "Offline") return null;

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
            const active = Boolean(c.dmSlug && activeSlug === c.dmSlug);
            const unread = c.unreadCount ?? 0;
            const preview =
              c.lastMessage != null
                ? `${c.lastMessage.sender}: ${c.lastMessage.text}`
                : c.statusMessage;
            return (
              <button
                key={c.id}
                type="button"
                className={cn("msn-contact", active && "msn-contact-active")}
                onClick={() => onMessage(c)}
                title={`Message ${c.name}`}
              >
                <MsnPresenceIcon status={status} size={16} className="mt-0.5" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {c.isFavorite ? "★ " : ""}
                    {c.name}{" "}
                    <span className="font-normal opacity-80">({presenceLabel(status)})</span>
                    {unread > 0 ? (
                      <span className="ml-1.5 inline-flex min-w-[1.1rem] justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    ) : null}
                  </span>
                  {preview && (
                    <span className="block truncate text-[11px] italic opacity-80">{preview}</span>
                  )}
                </span>
                {c.lastMessage && (
                  <span className="shrink-0 text-[10px] opacity-70">{timeAgo(c.lastMessage.at)}</span>
                )}
              </button>
            );
          })
        ))}
    </div>
  );
}

function matchesQuery(c: MsnContact, q: string) {
  if (!q) return true;
  const hay = `${c.name} ${c.username} ${c.statusMessage ?? ""}`.toLowerCase();
  return hay.includes(q);
}

export function BuddyList({
  online,
  offline,
  activeSlug,
  query = "",
  className,
}: {
  online: MsnContact[];
  offline: MsnContact[];
  activeSlug?: string;
  query?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const q = query.trim().toLowerCase();

  const { favorites, recent, onlineRest, offlineRest } = useMemo(() => {
    const all = [...online, ...offline].filter((c) => matchesQuery(c, q));
    const favorites = all
      .filter((c) => c.isFavorite)
      .sort((a, b) => a.name.localeCompare(b.name));
    const favoriteIds = new Set(favorites.map((c) => c.id));
    const recent = all
      .filter((c) => c.lastMessage && !favoriteIds.has(c.id))
      .sort((a, b) => (b.lastMessage?.at ?? "").localeCompare(a.lastMessage?.at ?? ""))
      .slice(0, 12);
    const recentIds = new Set(recent.map((c) => c.id));
    const claimed = new Set([...favoriteIds, ...recentIds]);
    const onlineRest = all.filter(
      (c) => !claimed.has(c.id) && (c.presence === "online" || c.presence === "away")
    );
    const offlineRest = all.filter((c) => !claimed.has(c.id) && c.presence === "offline");
    return { favorites, recent, onlineRest, offlineRest };
  }, [online, offline, q]);

  function message(c: MsnContact) {
    if (pending) return;
    if (c.dmSlug) {
      router.push(`/app/chat/${c.dmSlug}`);
      return;
    }
    start(async () => {
      try {
        await getOrCreateDm(c.id);
      } catch (err) {
        if (isRedirectError(err)) throw err;
      }
    });
  }

  return (
    <div className={cn("select-none", className)}>
      <Group
        title="Favorites"
        contacts={favorites}
        defaultOpen
        activeSlug={activeSlug}
        onMessage={message}
      />
      <Group
        title="Recent"
        contacts={recent}
        defaultOpen
        activeSlug={activeSlug}
        onMessage={message}
      />
      <Group
        title="Online"
        contacts={onlineRest}
        defaultOpen
        activeSlug={activeSlug}
        onMessage={message}
      />
      <Group
        title="Offline"
        contacts={offlineRest}
        defaultOpen={offlineRest.length > 0 && offlineRest.length <= 12}
        activeSlug={activeSlug}
        onMessage={message}
      />
      <p className="mt-2 px-1 text-[10px] text-[#666] dark:text-sage-500">
        Find more people in{" "}
        <Link href="/app/search" className="underline hover:text-brand-600">
          Search
        </Link>
        .
      </p>
    </div>
  );
}

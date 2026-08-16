import Link from "next/link";
import { MsnPresenceIcon } from "@/components/msn-presence-icon";
import { presenceLabel } from "@/lib/presence";
import { timeAgo } from "@/lib/utils";
import type { MsnContact } from "@/components/buddy-list";

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
  presence: string;
  statusMessage: string | null;
};

export function MessengerHomePane({
  me,
  onlineCount,
  online,
  rooms,
  embedded = false,
}: {
  me: Me;
  onlineCount: number;
  online: MsnContact[];
  rooms: Room[];
  embedded?: boolean;
}) {
  const hotRooms = [...rooms]
    .sort((a, b) => {
      if ((b.online ?? 0) !== (a.online ?? 0)) return (b.online ?? 0) - (a.online ?? 0);
      return (b.lastMessage?.at ?? "").localeCompare(a.lastMessage?.at ?? "");
    })
    .slice(0, 4);

  const liveBuddies = online.slice(0, 6);
  const status =
    me.presence === "away" || me.presence === "offline" ? me.presence : "online";

  return (
    <div className={embedded ? "flex h-full min-h-0 flex-col" : "msn-window msn-window-fill hidden lg:flex"}>
      <div className="border-b border-sage-200/60 px-6 py-5 dark:border-white/10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sage-500">
          Welcome back
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-sage-900 dark:text-white">
          {me.name}
        </h2>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-sage-500">
          <MsnPresenceIcon status={status} size={12} />
          {presenceLabel(status as "online" | "away" | "offline")}
          {me.statusMessage ? ` — ${me.statusMessage}` : ""}
        </p>
        <p className="mt-3 max-w-md text-sm text-sage-600 dark:text-sage-300">
          {onlineCount} online now. Pick a contact or jump into a room that’s buzzing.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-sage-200/50 bg-white/50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sage-500">
              Online now
            </h3>
            {liveBuddies.length === 0 ? (
              <p className="mt-3 text-sm text-sage-500">
                Nobody else is online yet — be the first to wave in a room.
              </p>
            ) : (
              <ul className="mt-2 space-y-1">
                {liveBuddies.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={c.dmSlug ? `/app/chat/${c.dmSlug}` : `/app/u/${c.username}`}
                      className="msn-contact"
                    >
                      <MsnPresenceIcon status={c.presence} size={14} />
                      <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-sage-200/50 bg-white/50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sage-500">
              Hot rooms
            </h3>
            <ul className="mt-2 space-y-1">
              {hotRooms.map((r) => (
                <li key={r.id}>
                  <Link href={`/app/chat/${r.slug}`} className="msn-contact">
                    <span className="text-sm">{r.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{r.name}</span>
                      <span className="block truncate text-xs text-sage-500">
                        {r.online > 0
                          ? `${r.online} online`
                          : r.lastMessage
                            ? `${r.lastMessage.sender}: ${r.lastMessage.text}`
                            : r.description}
                      </span>
                    </span>
                    {r.lastMessage && (
                      <span className="shrink-0 text-[10px] text-sage-400">
                        {timeAgo(r.lastMessage.at)}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="border-t border-sage-200/50 px-4 py-2.5 text-xs text-sage-500 dark:border-white/10">
        Select a contact or room to start chatting
      </div>
    </div>
  );
}

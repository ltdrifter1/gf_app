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
}: {
  me: Me;
  onlineCount: number;
  online: MsnContact[];
  rooms: Room[];
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
    <div className="msn-window msn-window-fill hidden lg:flex">
      <div className="msn-titlebar">
        <MsnPresenceIcon status={status} size={14} />
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold tracking-wide">
          Safely Messenger
        </span>
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

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f5f4ec] dark:bg-[#1a2433]">
        <div className="border-b border-[#a0a0a0] px-5 py-5 dark:border-white/10">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#555] dark:text-sage-400">
            Welcome back
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-[#0a246a] dark:text-white">
            {me.name}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#444] dark:text-sage-400">
            <MsnPresenceIcon status={status} size={12} />
            {presenceLabel(status as "online" | "away" | "offline")}
            {me.statusMessage ? ` — ${me.statusMessage}` : ""}
          </p>
          <p className="mt-3 text-[13px] text-[#444] dark:text-sage-300">
            {onlineCount} online now. Pick a contact or jump into a room that’s buzzing.
          </p>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <section className="msn-inset p-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#555] dark:text-sage-400">
              Online now
            </h3>
            {liveBuddies.length === 0 ? (
              <p className="mt-3 text-[12px] italic text-[#666] dark:text-sage-400">
                Nobody else is online yet — be the first to wave in a room.
              </p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {liveBuddies.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={c.dmSlug ? `/app/chat/${c.dmSlug}` : `/app/u/${c.username}`}
                      className="msn-contact rounded-sm"
                    >
                      <MsnPresenceIcon status={c.presence} size={14} />
                      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">
                        {c.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="msn-inset p-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#555] dark:text-sage-400">
              Hot rooms
            </h3>
            <ul className="mt-2 space-y-1.5">
              {hotRooms.map((r) => (
                <li key={r.id}>
                  <Link href={`/app/chat/${r.slug}`} className="msn-contact rounded-sm">
                    <span className="text-[12px]">{r.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold">{r.name}</span>
                      <span className="block truncate text-[11px] opacity-80">
                        {r.online > 0
                          ? `${r.online} online`
                          : r.lastMessage
                            ? `${r.lastMessage.sender}: ${r.lastMessage.text}`
                            : r.description}
                      </span>
                    </span>
                    {r.lastMessage && (
                      <span className="shrink-0 text-[10px] opacity-70">
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

      <div className="msn-statusbar">
        <MsnPresenceIcon status="online" size={12} />
        <span>Select a contact to open an Instant Message window</span>
      </div>
    </div>
  );
}

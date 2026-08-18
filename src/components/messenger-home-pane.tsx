import Link from "next/link";
import { MsnPresenceIcon } from "@/components/msn-presence-icon";
import { presenceLabel } from "@/lib/presence";
import type { MsnContact } from "@/components/buddy-list";

type Me = {
  name: string;
  presence: string;
  statusMessage: string | null;
};

export function MessengerHomePane({
  me,
  onlineCount,
  online,
  embedded = false,
}: {
  me: Me;
  onlineCount: number;
  online: MsnContact[];
  embedded?: boolean;
}) {
  const liveBuddies = online.slice(0, 8);
  const status =
    me.presence === "away" || me.presence === "offline" ? me.presence : "online";

  return (
    <div className={embedded ? "flex h-full min-h-0 flex-col" : "msn-window msn-window-fill hidden lg:flex"}>
      <div className="relative overflow-hidden border-b border-sage-200/50 px-6 py-6 dark:border-white/10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-brand-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-40 rounded-full bg-accent-400/10 blur-3xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage-500">
          Welcome back
        </p>
        <h2 className="mt-1.5 font-display text-[1.75rem] font-bold tracking-tight text-sage-900 dark:text-white">
          {me.name}
        </h2>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-sage-500">
          <MsnPresenceIcon status={status} size={12} />
          {presenceLabel(status as "online" | "away" | "offline")}
          {me.statusMessage ? ` — ${me.statusMessage}` : ""}
        </p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-sage-600 dark:text-sage-300">
          {onlineCount} online now. Open a contact or room to start chatting.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sage-500">
              Online now
            </h3>
            <span className="text-[11px] tabular-nums text-sage-400">{liveBuddies.length}</span>
          </div>
          {liveBuddies.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sage-200/70 px-4 py-8 text-center text-sm text-sage-500 dark:border-white/10">
              Nobody else is online yet — be the first to wave in a room.
            </p>
          ) : (
            <ul className="grid gap-1 sm:grid-cols-2">
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
      </div>

      <div className="border-t border-sage-200/50 px-4 py-2.5 text-xs text-sage-500 dark:border-white/10">
        Select a contact or room to start chatting
      </div>
    </div>
  );
}

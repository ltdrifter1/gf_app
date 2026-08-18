import Link from "next/link";
import Image from "next/image";
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
    <div
      className={
        embedded
          ? "flex h-full min-h-0 flex-col"
          : "msn-window msn-window-hero msn-window-fill hidden lg:flex"
      }
    >
      <div className="msn-hero-peer shrink-0">
        <div className="msn-hero-avatar">
          <Image
            src="/logo.webp"
            alt=""
            width={44}
            height={44}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] font-semibold tracking-tight text-[#0a3a6e] dark:text-white">
            {me.name}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#4a5568] dark:text-sage-400">
            <MsnPresenceIcon status={status} size={11} />
            {presenceLabel(status as "online" | "away" | "offline")}
            {me.statusMessage ? ` — ${me.statusMessage}` : ""}
          </p>
        </div>
      </div>

      <div className="msn-inset m-2.5 min-h-0 flex-1 overflow-y-auto p-3.5">
        <p className="text-[13.5px] leading-relaxed text-[#1a1a1a] dark:text-sage-100">
          {onlineCount} people online. Open a contact or room from the list to start chatting —
          Instant Message style.
        </p>

        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748b]">
            Online now
          </p>
          {liveBuddies.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#94a3b8]/50 px-3 py-6 text-center text-[12.5px] text-[#64748b]">
              Nobody else is online yet — be the first to wave in a room.
            </p>
          ) : (
            <ul className="space-y-0.5">
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
        </div>
      </div>

      <div className="msn-statusbar shrink-0">
        Select a contact or room to start chatting
      </div>
    </div>
  );
}

import Link from "next/link";
import { timeAgo, cn } from "@/lib/utils";

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

export function RoomsList({
  rooms,
  activeSlug,
  query = "",
}: {
  rooms: Room[];
  activeSlug?: string;
  query?: string;
}) {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? rooms.filter((r) =>
        `${r.name} ${r.description ?? ""} ${r.lastMessage?.text ?? ""}`.toLowerCase().includes(q)
      )
    : rooms;

  if (filtered.length === 0) {
    return (
      <p className="px-4 py-1 text-[11px] italic text-[#666] dark:text-sage-400">
        No rooms match
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {filtered.map((r) => {
        const active = activeSlug === r.slug;
        return (
          <Link
            key={r.id}
            href={`/app/chat/${r.slug}`}
            className={cn("msn-contact", active && "msn-contact-active")}
          >
            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center text-[12px]">
              {r.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">
                {r.name}
                {r.online > 0 ? (
                  <span className="ml-1 font-normal opacity-80">({r.online} online)</span>
                ) : null}
                {(r.unreadCount ?? 0) > 0 ? (
                  <span className="ml-1.5 inline-flex min-w-[1.1rem] justify-center rounded-sm bg-[#316ac5] px-1 text-[10px] font-bold text-white">
                    {r.unreadCount! > 99 ? "99+" : r.unreadCount}
                  </span>
                ) : null}
              </span>
              <span className="block truncate text-[11px] opacity-80">
                {r.lastMessage
                  ? `${r.lastMessage.sender}: ${r.lastMessage.text}`
                  : r.description}
              </span>
            </span>
            {r.lastMessage && (
              <span className="shrink-0 text-[10px] opacity-70">{timeAgo(r.lastMessage.at)}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

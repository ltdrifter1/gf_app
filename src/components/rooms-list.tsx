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
  lastMessage: { text: string; sender: string; at: string } | null;
};

export function RoomsList({ rooms, activeSlug }: { rooms: Room[]; activeSlug?: string }) {
  return (
    <div className="space-y-0.5">
      {rooms.map((r) => {
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

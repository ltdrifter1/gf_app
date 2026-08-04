import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getRoomsWithStats } from "@/lib/chat";
import { getOnlineBuddies, getDirectMessageRooms } from "@/lib/actions/chat";
import { RoomsList } from "@/components/rooms-list";
import { BuddyList } from "@/components/buddy-list";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default async function ChatHome() {
  const user = await requireUser();
  const [rooms, buddies, dms] = await Promise.all([
    getRoomsWithStats(),
    getOnlineBuddies(user.id),
    getDirectMessageRooms(user.id),
  ]);

  return (
    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <h1 className="font-display text-xl font-bold text-sage-900 dark:text-white">
              Messenger
            </h1>
            <span className="chip bg-emerald-500/15 text-emerald-600">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-500" />
              {buddies.length + 1} online
            </span>
          </div>

          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-sage-400">
            Online now
          </h2>
          <BuddyList buddies={buddies} />
        </div>

        {dms.length > 0 && (
          <div className="card p-4">
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-sage-400">
              Direct messages
            </h2>
            <div className="space-y-1">
              {dms.map((dm) => (
                <Link
                  key={dm.id}
                  href={`/app/chat/${dm.slug}`}
                  className="flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-sage-100/60 dark:hover:bg-white/5"
                >
                  <Avatar
                    name={dm.name}
                    src={dm.avatarUrl}
                    size={40}
                    presence={dm.presence}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sage-900 dark:text-white">
                      {dm.name}
                    </p>
                    <p className="truncate text-xs text-sage-500">
                      {dm.lastMessage
                        ? `${dm.lastMessage.sender}: ${dm.lastMessage.text}`
                        : "Start chatting"}
                    </p>
                  </div>
                  {dm.lastMessage && (
                    <span className="shrink-0 text-[10px] text-sage-400">
                      {timeAgo(dm.lastMessage.at)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="card p-4">
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-sage-400">
            Community rooms
          </h2>
          <RoomsList rooms={rooms} />
        </div>
      </div>

      <div className="card hidden flex-col items-center justify-center p-10 text-center lg:flex">
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-amity-gradient text-white shadow-glow">
          <MessageCircle className="h-9 w-9" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold text-sage-900 dark:text-white">
          Pick a buddy or a room
        </h2>
        <p className="mt-2 max-w-sm text-sage-500 dark:text-sage-400">
          Message someone online, or jump into a community lounge — MSN vibes,
          modern support.
        </p>
      </div>
    </div>
  );
}

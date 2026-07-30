import { requireUser } from "@/lib/auth";
import { getRoomsWithStats } from "@/lib/chat";
import { RoomsList } from "@/components/rooms-list";
import { MessageCircle } from "lucide-react";

export default async function ChatHome() {
  await requireUser();
  const rooms = await getRoomsWithStats();

  return (
    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[340px_1fr]">
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <h1 className="font-display text-xl font-bold text-sage-900 dark:text-white">
            Messenger
          </h1>
          <span className="chip bg-emerald-500/15 text-emerald-600">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-500" />
            Online
          </span>
        </div>
        <RoomsList rooms={rooms} />
      </div>
      <div className="card hidden flex-col items-center justify-center p-10 text-center lg:flex">
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-circle-gradient text-white shadow-glow">
          <MessageCircle className="h-9 w-9" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold text-sage-900 dark:text-white">
          Welcome to the lounge
        </h2>
        <p className="mt-2 max-w-sm text-sage-500 dark:text-sage-400">
          Pick a room from your buddy list. Presence dots, typing indicators, and
          people who get it — MSN vibes, modern support.
        </p>
      </div>
    </div>
  );
}

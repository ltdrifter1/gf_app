import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getRoomsWithStats } from "@/lib/chat";
import { RoomsList } from "@/components/rooms-list";
import { MessageCircle, Crown } from "lucide-react";

export default async function ChatHome() {
  const user = await requireUser();
  const rooms = await getRoomsWithStats({ includePremium: user.isPremium });

  return (
    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[340px_1fr]">
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <h1 className="font-display text-xl font-bold text-sage-900 dark:text-white">
            Messenger
          </h1>
          <span className="chip bg-emerald-500/15 text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
            Online
          </span>
        </div>
        <RoomsList rooms={rooms} />
        {!user.isPremium && (
          <Link
            href="/app/premium"
            className="mt-3 flex items-center gap-2 rounded-2xl border border-warm-400/30 bg-warm-400/10 px-3 py-2.5 text-sm text-warm-500 transition hover:bg-warm-400/20"
          >
            <Crown className="h-4 w-4" />
            Unlock Premium Lounge
          </Link>
        )}
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

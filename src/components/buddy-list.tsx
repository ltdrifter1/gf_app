"use client";

import Link from "next/link";
import { Avatar } from "./ui/avatar";
import { MessageButton } from "./message-button";

type Buddy = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  presence: string;
  bio: string | null;
};

export function BuddyList({ buddies }: { buddies: Buddy[] }) {
  if (buddies.length === 0) {
    return (
      <p className="px-1 py-3 text-sm text-sage-500">
        No one else online right now. Be the first to say hi in a room.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {buddies.map((b) => (
        <div
          key={b.id}
          className="flex items-center gap-2.5 rounded-2xl p-2 hover:bg-sage-100/60 dark:hover:bg-white/5"
        >
          <Link href={`/app/u/${b.username}`}>
            <Avatar name={b.name} src={b.avatarUrl} size={40} presence={b.presence} />
          </Link>
          <Link href={`/app/u/${b.username}`} className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sage-900 dark:text-white">
              {b.name}
            </p>
            <p className="truncate text-xs text-sage-500">@{b.username}</p>
          </Link>
          <MessageButton targetUserId={b.id} compact />
        </div>
      ))}
    </div>
  );
}

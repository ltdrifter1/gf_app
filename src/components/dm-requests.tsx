"use client";

import { useTransition } from "react";
import Link from "next/link";
import { acceptDmRequest, declineDmRequest } from "@/lib/actions/blocks";
import { Avatar } from "@/components/ui/avatar";

export type DmRequestRow = {
  roomId: string;
  slug: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  preview: string | null;
};

export function DmRequests({ requests }: { requests: DmRequestRow[] }) {
  const [pending, start] = useTransition();
  if (requests.length === 0) return null;

  return (
    <section className="card space-y-3 p-4">
      <h2 className="font-display font-semibold text-sage-900 dark:text-white">
        Message requests
      </h2>
      <ul className="space-y-2">
        {requests.map((r) => (
          <li
            key={r.roomId}
            className="flex items-center gap-3 rounded-xl bg-white/60 p-3 dark:bg-white/5"
          >
            <Avatar name={r.name} src={r.avatarUrl} size={36} />
            <div className="min-w-0 flex-1">
              <Link href={`/app/chat/${r.slug}`} className="font-medium hover:underline">
                {r.name}
              </Link>
              <p className="truncate text-xs text-sage-500">{r.preview || "Wants to message you"}</p>
            </div>
            <button
              type="button"
              className="btn-primary text-xs"
              disabled={pending}
              onClick={() => start(async () => { await acceptDmRequest(r.roomId); })}
            >
              Accept
            </button>
            <button
              type="button"
              className="btn-ghost text-xs"
              disabled={pending}
              onClick={() => start(async () => { await declineDmRequest(r.roomId); })}
            >
              Decline
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

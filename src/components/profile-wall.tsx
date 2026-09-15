"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { addWallComment, deleteWallComment } from "@/lib/actions/studio";
import type { WallComment } from "@/components/myspace-profile";
import { timeAgo } from "@/lib/utils";

export function ProfileWall({
  profileUserId,
  isOwn,
  viewerId,
  comments,
}: {
  profileUserId: string;
  isOwn: boolean;
  viewerId?: string;
  comments: WallComment[];
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");

  return (
    <div className="space-y-3">
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData();
          fd.set("content", text);
          setError(null);
          start(async () => {
            const res = await addWallComment(profileUserId, fd);
            if (res && "error" in res && res.error) setError(res.error);
            else setText("");
          });
        }}
      >
        <label className="text-xs font-medium opacity-70">Leave a note (plain text, 280 chars)</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 280))}
          rows={2}
          className="input mt-1"
          placeholder="Thanks for the pad thai rec…"
        />
        {error ? <p className="text-xs text-rose-600">{error}</p> : null}
        <button type="submit" disabled={pending || text.trim().length < 2} className="btn-secondary text-sm">
          {pending ? "Posting…" : "Sign guestbook"}
        </button>
      </form>

      {comments.length === 0 ? (
        <p className="py-4 text-center text-sm opacity-60">No notes on this wall yet. Be the first.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => {
            const canDelete = isOwn || c.author.id === viewerId;
            const created = typeof c.createdAt === "string" ? c.createdAt : c.createdAt.toISOString();
            return (
              <li key={c.id} className="flex gap-2 text-sm">
                <Avatar name={c.author.name} src={c.author.avatarUrl} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <Link href={`/app/u/${c.author.username}`} className="font-semibold hover:underline">
                      {c.author.name}
                    </Link>
                    <span className="text-[10px] opacity-50">{timeAgo(created)}</span>
                  </div>
                  <p className="whitespace-pre-wrap break-words">{c.content}</p>
                  {canDelete ? (
                    <button
                      type="button"
                      className="mt-1 text-[11px] text-rose-600 hover:underline"
                      onClick={() => start(async () => { await deleteWallComment(c.id); })}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { blockUser, muteUser, unblockUser, unmuteUser } from "@/lib/actions/blocks";

export function BlockMuteButtons({
  targetUserId,
  initiallyBlocked,
  initiallyMuted,
}: {
  targetUserId: string;
  initiallyBlocked?: boolean;
  initiallyMuted?: boolean;
}) {
  const [pending, start] = useTransition();
  const [blocked, setBlocked] = useState(!!initiallyBlocked);
  const [muted, setMuted] = useState(!!initiallyMuted);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="btn-ghost text-sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = blocked ? await unblockUser(targetUserId) : await blockUser(targetUserId);
            if (res && "error" in res && res.error) setError(res.error);
            else setBlocked(!blocked);
          })
        }
      >
        {blocked ? "Unblock" : "Block"}
      </button>
      <button
        type="button"
        className="btn-ghost text-sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = muted ? await unmuteUser(targetUserId) : await muteUser(targetUserId);
            if (res && "error" in res && res.error) setError(res.error);
            else setMuted(!muted);
          })
        }
      >
        {muted ? "Unmute" : "Mute"}
      </button>
      {error ? <p className="text-xs text-rose-500">{error}</p> : null}
    </div>
  );
}

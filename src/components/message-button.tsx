"use client";

import { useTransition } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { getOrCreateDm } from "@/lib/actions/chat";

export function MessageButton({
  targetUserId,
  compact,
}: {
  targetUserId: string;
  compact?: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className={compact ? "btn-ghost p-2" : "btn-secondary"}
      title="Message"
      onClick={() =>
        start(async () => {
          await getOrCreateDm(targetUserId);
        })
      }
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageCircle className="h-4 w-4" />
      )}
      {!compact && "Message"}
    </button>
  );
}

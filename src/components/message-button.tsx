"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { getOrCreateDm } from "@/lib/actions/chat";

function isRedirectError(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: string }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function MessageButton({
  targetUserId,
  compact,
}: {
  targetUserId: string;
  compact?: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={compact ? "inline-flex" : "flex flex-col items-start gap-1"}>
      <button
        type="button"
        disabled={pending}
        className={compact ? "btn-ghost p-2" : "btn-secondary"}
        title="Message"
        onClick={() =>
          start(async () => {
            setError(null);
            try {
              const result = await getOrCreateDm(targetUserId);
              if (result?.error) setError(result.error);
            } catch (err) {
              if (isRedirectError(err)) throw err;
              setError("Couldn't start chat");
            }
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
      {error && !compact && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

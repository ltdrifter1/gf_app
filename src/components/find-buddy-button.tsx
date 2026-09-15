"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake, Loader2 } from "lucide-react";
import { findBuddyMatch } from "@/lib/actions/buddy";
import { cn } from "@/lib/utils";

function isRedirectError(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: string }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function FindBuddyButton({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    start(async () => {
      try {
        const res = await findBuddyMatch();
        if (res?.error) {
          setError(res.error);
          return;
        }
        if (res && "slug" in res && res.slug) {
          router.push(`/app/chat/${res.slug}`);
        }
      } catch (err) {
        if (isRedirectError(err)) throw err;
        setError("Couldn't find a buddy right now.");
      }
    });
  }

  return (
    <div className={cn("min-w-0", className)}>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className={cn(
          compact ? "btn-ghost px-2 py-1 text-[11px]" : "btn-primary text-sm",
          "w-full justify-center"
        )}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <HeartHandshake className="h-4 w-4" />}
        {pending ? "Matching…" : "Find me a buddy"}
      </button>
      {error && (
        <p className="mt-1 text-[11px] text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

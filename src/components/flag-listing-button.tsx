"use client";

import { useState, useTransition } from "react";
import { flagContent } from "@/lib/actions/moderation";

export function FlagListingButton({ restaurantId }: { restaurantId: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn-ghost text-sm text-rose-600"
      disabled={pending || done}
      onClick={() =>
        start(async () => {
          const res = await flagContent({
            type: "restaurant",
            refId: restaurantId,
            reason: "Dining listing report",
          });
          if (!res?.error) setDone(true);
        })
      }
    >
      {done ? "Reported" : "Report this listing"}
    </button>
  );
}

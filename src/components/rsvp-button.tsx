"use client";

import { useState, useTransition } from "react";
import { Check, CalendarPlus } from "lucide-react";
import { toggleRsvp } from "@/lib/actions/events";

export function RsvpButton({ eventId, going }: { eventId: string; going: boolean }) {
  const [isGoing, setIsGoing] = useState(going);
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => { setIsGoing((v) => !v); startTransition(() => toggleRsvp(eventId)); }}
      disabled={pending}
      className={`btn px-4 py-2 text-sm ${isGoing ? "bg-emerald-500 text-white" : "btn-secondary"}`}
    >
      {isGoing ? <><Check className="h-4 w-4" /> Going</> : <><CalendarPlus className="h-4 w-4" /> RSVP</>}
    </button>
  );
}

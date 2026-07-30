"use client";

import { useState, useTransition } from "react";
import { Crown, Loader2, Check } from "lucide-react";
import { upgradeToPremium, cancelPremium } from "@/lib/actions/premium";

export function PremiumButton({ isPremium }: { isPremium: boolean }) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");

  if (isPremium) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 font-medium text-emerald-700 dark:text-emerald-300">
          <Check className="h-5 w-5" /> You're a Premium member
        </div>
        <button
          onClick={() => startTransition(async () => { await cancelPremium(); })}
          disabled={pending}
          className="btn-ghost w-full text-sm"
        >
          {pending ? "…" : "Cancel membership"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() =>
          startTransition(async () => {
            const r = await upgradeToPremium();
            if (r?.simulated) setNote("Simulated checkout (no Stripe key set). You're now Premium! 🎉");
          })
        }
        disabled={pending}
        className="btn w-full bg-gradient-to-r from-warm-400 to-warm-500 px-6 py-3 text-base font-semibold text-white hover:opacity-95"
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Crown className="h-5 w-5" />}
        Upgrade to Premium — $9/mo
      </button>
      {note && <p className="text-center text-xs text-emerald-600">{note}</p>}
    </div>
  );
}

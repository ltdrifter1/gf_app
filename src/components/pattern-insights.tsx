"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { dismissInsight, setInsightsOptIn } from "@/lib/actions/insights";

type Insight = { key: string; title: string; body: string; href?: string };

export function PatternInsights({
  optIn,
  insights,
}: {
  optIn: boolean;
  insights: Insight[];
}) {
  const [on, setOn] = useState(optIn);
  const [items, setItems] = useState(insights);
  const [pending, start] = useTransition();

  return (
    <section className="card space-y-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-sage-900 dark:text-white">
            <Sparkles className="h-4 w-4 text-brand-600" /> Private patterns
          </h2>
          <p className="text-sm text-sage-500">
            Opt-in only. From your mood, journal, and glutening logs. Never public. Never scolding.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-xs font-medium text-sage-600">
          <input
            type="checkbox"
            checked={on}
            disabled={pending}
            onChange={(e) => {
              const next = e.target.checked;
              setOn(next);
              start(async () => {
                await setInsightsOptIn(next);
              });
            }}
          />
          Opt in
        </label>
      </div>

      {!on ? (
        <p className="text-sm text-sage-500">Turn this on when you want gentle, private observations.</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-sage-500">
          Not enough private notes yet — or you dismissed the current cards. Keep logging only if it helps.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.key} className="rounded-2xl bg-white/70 p-3 dark:bg-white/5">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-sage-900 dark:text-white">{i.title}</p>
                  <p className="mt-0.5 text-sm text-sage-600 dark:text-sage-300">{i.body}</p>
                  {i.href && (
                    <Link href={i.href} className="mt-1 inline-block text-xs font-medium text-brand-600 hover:underline">
                      Open related space
                    </Link>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-ghost p-1"
                  aria-label="Dismiss insight"
                  onClick={() => {
                    start(async () => {
                      await dismissInsight(i.key);
                      setItems((prev) => prev.filter((x) => x.key !== i.key));
                    });
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

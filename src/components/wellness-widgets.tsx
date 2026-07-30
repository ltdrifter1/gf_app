"use client";

import { useRef, useState, useTransition } from "react";
import { MOOD_OPTIONS, JOURNAL_PROMPTS } from "@/lib/constants";
import { logMood, addJournal } from "@/lib/actions/wellness";

export function MoodTracker() {
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  return (
    <div>
      {done ? (
        <p className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          Logged. Thanks for checking in with yourself 💙
        </p>
      ) : (
        <form
          ref={ref}
          action={(fd) => {
            if (!selected) return;
            fd.set("mood", String(selected));
            startTransition(async () => { await logMood(fd); setDone(true); });
          }}
          className="space-y-3"
        >
          <div className="flex justify-between">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setSelected(m.value)}
                className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 transition ${
                  selected === m.value ? "bg-brand-50 dark:bg-brand-500/15 scale-110" : "hover:bg-sage-100/60 dark:hover:bg-white/5"
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] text-sage-500">{m.label}</span>
              </button>
            ))}
          </div>
          <input name="note" className="input" placeholder="Add a note (optional)" />
          <button type="submit" disabled={!selected || pending} className="btn-primary w-full">
            {pending ? "Saving…" : "Log mood"}
          </button>
        </form>
      )}
    </div>
  );
}

export function JournalWidget() {
  const [prompt, setPrompt] = useState(JOURNAL_PROMPTS[0]);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  function shuffle() {
    setPrompt(JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]);
  }

  return (
    <div className="space-y-3">
      <button onClick={shuffle} className="w-full rounded-2xl bg-brand-50 dark:bg-brand-500/10 p-3 text-left text-sm text-brand-700 dark:text-brand-200">
        ✍️ {prompt} <span className="text-xs opacity-60">(tap for another)</span>
      </button>
      {done ? (
        <p className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          Saved to your private journal.
        </p>
      ) : (
        <form
          ref={ref}
          action={(fd) => {
            fd.set("prompt", prompt);
            startTransition(async () => { const r = await addJournal(fd); if (!r?.error) setDone(true); });
          }}
          className="space-y-3"
        >
          <textarea name="content" required rows={4} className="input resize-none" placeholder="Write freely — this is just for you." />
          <button type="submit" disabled={pending} className="btn-primary w-full">{pending ? "Saving…" : "Save entry"}</button>
        </form>
      )}
    </div>
  );
}

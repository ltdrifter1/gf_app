"use client";

import { useMemo, useState, useTransition, useCallback } from "react";
import { format } from "date-fns";
import { Shuffle, Feather, Lock, Check } from "lucide-react";
import { JOURNAL_PROMPTS, MOOD_OPTIONS } from "@/lib/constants";
import { addJournal, logMood } from "@/lib/actions/wellness";
import { cn, timeAgo } from "@/lib/utils";

export type JournalEntryView = {
  id: string;
  prompt: string | null;
  content: string;
  createdAt: string;
};

export function MoodCheckIn({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    if (!selected) return;
    const fd = new FormData();
    fd.set("mood", String(selected));
    if (note.trim()) fd.set("note", note.trim());
    startTransition(async () => {
      await logMood(fd);
      setJustSaved(true);
      setNote("");
      window.setTimeout(() => setJustSaved(false), 2200);
    });
  }

  return (
    <div className={cn(!compact && "space-y-3")}>
      <div className={cn("flex", compact ? "justify-between gap-1" : "justify-between")}>
        {MOOD_OPTIONS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setSelected(m.value)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-2xl px-1.5 py-2 transition",
              selected === m.value
                ? "bg-brand-500/15 text-brand-800 ring-1 ring-brand-400/40 dark:text-brand-100"
                : "text-sage-500 hover:bg-white/50 dark:hover:bg-white/5"
            )}
            aria-label={m.label}
            aria-pressed={selected === m.value}
          >
            <span className={cn(compact ? "text-xl" : "text-2xl")}>{m.emoji}</span>
            {!compact && <span className="text-[10px] font-medium">{m.label}</span>}
          </button>
        ))}
      </div>
      {!compact && (
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input"
          placeholder="Optional note"
          maxLength={120}
        />
      )}
      <button
        type="button"
        onClick={save}
        disabled={!selected || pending}
        className={cn("btn-primary w-full", compact && "mt-3 py-2 text-sm")}
      >
        {pending ? "Saving…" : justSaved ? "Logged" : "Log mood"}
      </button>
    </div>
  );
}

/** @deprecated use MoodCheckIn */
export function MoodTracker() {
  return <MoodCheckIn />;
}

export function JournalStudio({
  initialEntries,
}: {
  initialEntries: JournalEntryView[];
}) {
  const [prompt, setPrompt] = useState(
    () => JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]
  );
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState(initialEntries);
  const [pending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = useMemo(() => {
    const t = content.trim();
    if (!t) return 0;
    return t.split(/\s+/).length;
  }, [content]);

  const shufflePrompt = useCallback(() => {
    let next = prompt;
    if (JOURNAL_PROMPTS.length > 1) {
      while (next === prompt) {
        next = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
      }
    }
    setPrompt(next);
  }, [prompt]);

  function save() {
    const body = content.trim();
    if (!body) {
      setError("Write a few words first");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.set("prompt", prompt);
    fd.set("content", body);
    startTransition(async () => {
      const result = await addJournal(fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.entry) {
        setEntries((prev) => [result.entry!, ...prev]);
      }
      setContent("");
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1800);
      shufflePrompt();
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
      {/* Writing canvas */}
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/40 bg-white/55 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1715]/80">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_20%_0%,rgba(13,148,136,0.16),transparent_60%)]" />
        <div className="relative flex items-center justify-between gap-3 border-b border-sage-200/60 px-6 py-4 dark:border-white/10">
          <div className="flex items-center gap-2 text-sage-500">
            <Feather className="h-4 w-4 text-brand-600" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">
              Private journal
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-sage-400">
            <Lock className="h-3 w-3" /> Only you
          </span>
        </div>

        <div className="relative space-y-5 px-6 py-6 sm:px-8 sm:py-8">
          <div>
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className="font-display text-2xl font-semibold leading-snug tracking-tight text-sage-900 dark:text-white sm:text-[1.75rem]">
                {prompt}
              </p>
              <button
                type="button"
                onClick={() => shufflePrompt()}
                className="btn-ghost shrink-0 rounded-full p-2.5"
                title="Another prompt"
                aria-label="Shuffle prompt"
              >
                <Shuffle className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {JOURNAL_PROMPTS.slice(0, 3).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className={cn(
                    "max-w-full truncate rounded-full px-3 py-1 text-[11px] font-medium transition",
                    p === prompt
                      ? "bg-sage-900 text-white dark:bg-white dark:text-sage-900"
                      : "bg-white/70 text-sage-600 hover:bg-white dark:bg-white/5 dark:text-sage-300"
                  )}
                >
                  {p.length > 42 ? `${p.slice(0, 42)}…` : p}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null);
            }}
            rows={12}
            placeholder="Write freely. No audience. No edits required."
            className="w-full resize-none rounded-3xl border border-sage-200/70 bg-white/80 px-5 py-5 font-display text-lg leading-relaxed text-sage-900 outline-none transition placeholder:text-sage-400 focus:border-brand-400/50 focus:ring-4 focus:ring-brand-400/15 dark:border-white/10 dark:bg-black/20 dark:text-sage-50 dark:placeholder:text-sage-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-sage-400">
              {wordCount === 0 ? "Start anywhere" : `${wordCount} word${wordCount === 1 ? "" : "s"}`}
            </p>
            <div className="flex items-center gap-2">
              {savedFlash && (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                  <Check className="h-4 w-4" /> Saved
                </span>
              )}
              <button
                type="button"
                onClick={save}
                disabled={pending || !content.trim()}
                className="btn-primary px-6"
              >
                {pending ? "Saving…" : "Save entry"}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-rose-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>

      {/* History + mood */}
      <aside className="space-y-4">
        <div className="rounded-[1.75rem] border border-white/40 bg-white/55 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1715]/80">
          <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
            How are you?
          </h2>
          <p className="mb-3 text-sm text-sage-500">Quick check-in for your profile</p>
          <MoodCheckIn compact />
        </div>

        <div className="rounded-[1.75rem] border border-white/40 bg-white/55 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1715]/80">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
              Your entries
            </h2>
            <span className="text-xs font-medium text-sage-400">{entries.length}</span>
          </div>

          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sage-300/70 px-4 py-10 text-center dark:border-white/15">
              <p className="font-display text-base text-sage-700 dark:text-sage-200">
                Your first page is waiting
              </p>
              <p className="mt-1 text-sm text-sage-500">
                Entries stay private on Safely.
              </p>
            </div>
          ) : (
            <ol className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
              {entries.map((entry, i) => (
                <li
                  key={entry.id}
                  className="animate-fade-in rounded-2xl bg-gradient-to-br from-white/90 to-brand-50/40 p-4 dark:from-white/[0.06] dark:to-brand-500/10"
                  style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <time className="text-[11px] font-semibold uppercase tracking-wider text-brand-700/80 dark:text-brand-300">
                      {format(new Date(entry.createdAt), "MMM d · h:mm a")}
                    </time>
                    <span className="text-[10px] text-sage-400">{timeAgo(entry.createdAt)}</span>
                  </div>
                  {entry.prompt && (
                    <p className="mt-2 line-clamp-2 font-display text-sm font-medium text-sage-800 dark:text-sage-100">
                      {entry.prompt}
                    </p>
                  )}
                  <p className="mt-1.5 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-sage-600 dark:text-sage-300">
                    {entry.content}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </aside>
    </div>
  );
}

/** @deprecated use JournalStudio */
export function JournalWidget() {
  return <JournalStudio initialEntries={[]} />;
}

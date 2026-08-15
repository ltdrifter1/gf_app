"use client";

import { useMemo, useState, useTransition, useCallback } from "react";
import { format } from "date-fns";
import { Shuffle, Feather, Lock, Check, Pencil, Trash2, X } from "lucide-react";
import { JOURNAL_PROMPTS, MOOD_OPTIONS } from "@/lib/constants";
import { addJournal, deleteJournal, logMood, updateJournal } from "@/lib/actions/wellness";
import { cn, timeAgo } from "@/lib/utils";

export type JournalEntryView = {
  id: string;
  prompt: string | null;
  content: string;
  mood: number | null;
  createdAt: string;
  updatedAt?: string;
};

export type MoodEntryView = {
  id: string;
  mood: number;
  note: string | null;
  shareToProfile: boolean;
  createdAt: string;
};

export function MoodCheckIn({
  compact = false,
  onLogged,
}: {
  compact?: boolean;
  onLogged?: (entry: MoodEntryView) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [shareToProfile, setShareToProfile] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    if (!selected) return;
    setError(null);
    const fd = new FormData();
    fd.set("mood", String(selected));
    if (note.trim()) fd.set("note", note.trim());
    if (shareToProfile) fd.set("shareToProfile", "true");
    startTransition(async () => {
      const result = await logMood(fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.entry) onLogged?.(result.entry);
      setJustSaved(true);
      setNote("");
      setSelected(null);
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
          placeholder="Optional private note"
          maxLength={120}
        />
      )}
      <label className="mt-2 flex items-start gap-2 text-xs text-sage-500">
        <input
          type="checkbox"
          checked={shareToProfile}
          onChange={(e) => setShareToProfile(e.target.checked)}
          className="mt-0.5 rounded border-sage-300"
        />
        <span>
          Share as public profile status
          <span className="mt-0.5 block text-sage-400">Off by default — stays in Track only</span>
        </span>
      </label>
      <button
        type="button"
        onClick={save}
        disabled={!selected || pending}
        className={cn("btn-primary w-full", compact && "mt-3 py-2 text-sm")}
      >
        {pending ? "Saving…" : justSaved ? "Logged" : "Log mood"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** @deprecated use MoodCheckIn */
export function MoodTracker() {
  return <MoodCheckIn />;
}

export function MoodTrend({ entries }: { entries: MoodEntryView[] }) {
  const last14 = useMemo(() => {
    const cutoff = Date.now() - 14 * 86400_000;
    return [...entries]
      .filter((e) => new Date(e.createdAt).getTime() >= cutoff)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [entries]);

  const avg =
    last14.length === 0
      ? null
      : last14.reduce((s, e) => s + e.mood, 0) / last14.length;

  if (last14.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-sage-300/70 px-4 py-8 text-center dark:border-white/15">
        <p className="font-display text-base text-sage-700 dark:text-sage-200">No mood logs yet</p>
        <p className="mt-1 text-sm text-sage-500">Check in above to see your 14-day trend.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-2">
        <p className="text-sm text-sage-500">
          {last14.length} check-in{last14.length === 1 ? "" : "s"} · last 14 days
        </p>
        {avg != null && (
          <p className="text-sm font-semibold text-sage-800 dark:text-sage-100">
            Avg {avg.toFixed(1)}
          </p>
        )}
      </div>
      <div className="flex h-24 items-end gap-1.5">
        {last14.map((e) => {
          const opt = MOOD_OPTIONS.find((o) => o.value === e.mood);
          const h = `${(e.mood / 5) * 100}%`;
          return (
            <div
              key={e.id}
              className="group relative flex flex-1 flex-col items-center justify-end"
              title={`${opt?.label ?? e.mood} · ${format(new Date(e.createdAt), "MMM d")}`}
            >
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400/80 transition group-hover:from-brand-500 group-hover:to-brand-300"
                style={{ height: h, minHeight: 6 }}
              />
            </div>
          );
        })}
      </div>
      <ol className="max-h-40 space-y-2 overflow-y-auto">
        {[...last14].reverse().slice(0, 8).map((e) => {
          const opt = MOOD_OPTIONS.find((o) => o.value === e.mood);
          return (
            <li key={e.id} className="flex items-start gap-2 text-sm">
              <span className="text-base leading-none">{opt?.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sage-800 dark:text-sage-100">
                  {opt?.label}
                  {e.note ? ` · ${e.note}` : ""}
                </p>
                <p className="text-[11px] text-sage-400">
                  {timeAgo(e.createdAt)}
                  {e.shareToProfile ? " · shared to profile" : " · private"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
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
  const [entryMood, setEntryMood] = useState<number | null>(null);
  const [entries, setEntries] = useState(initialEntries);
  const [pending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [query, setQuery] = useState("");

  const wordCount = useMemo(() => {
    const t = content.trim();
    if (!t) return 0;
    return t.split(/\s+/).length;
  }, [content]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.content.toLowerCase().includes(q) ||
        (e.prompt && e.prompt.toLowerCase().includes(q))
    );
  }, [entries, query]);

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
    if (entryMood) fd.set("mood", String(entryMood));
    startTransition(async () => {
      const result = await addJournal(fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.entry) {
        setEntries((prev) => [result.entry!, ...prev]);
        setOpenId(result.entry.id);
      }
      setContent("");
      setEntryMood(null);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1800);
      shufflePrompt();
    });
  }

  function startEdit(entry: JournalEntryView) {
    setEditingId(entry.id);
    setEditContent(entry.content);
    setEditPrompt(entry.prompt || "");
    setOpenId(entry.id);
  }

  function saveEdit() {
    if (!editingId) return;
    const body = editContent.trim();
    if (!body) {
      setError("Write a few words first");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.set("id", editingId);
    fd.set("content", body);
    fd.set("prompt", editPrompt);
    startTransition(async () => {
      const result = await updateJournal(fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.entry) {
        setEntries((prev) => prev.map((e) => (e.id === result.entry!.id ? result.entry! : e)));
      }
      setEditingId(null);
    });
  }

  function remove(id: string) {
    if (!window.confirm("Delete this private entry? This can’t be undone.")) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      const result = await deleteJournal(fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (openId === id) setOpenId(null);
      if (editingId === id) setEditingId(null);
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
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
            <Lock className="h-3 w-3" /> Only you — never on your profile
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

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-sage-400">Mood with this entry</span>
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setEntryMood((prev) => (prev === m.value ? null : m.value))}
                className={cn(
                  "rounded-full px-2.5 py-1 text-sm transition",
                  entryMood === m.value
                    ? "bg-brand-500/15 ring-1 ring-brand-400/40"
                    : "hover:bg-white/60 dark:hover:bg-white/5"
                )}
                aria-label={m.label}
                aria-pressed={entryMood === m.value}
              >
                {m.emoji}
              </button>
            ))}
          </div>

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

      <aside className="space-y-4">
        <div className="rounded-[1.75rem] border border-white/40 bg-white/55 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1715]/80">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
              Your entries
            </h2>
            <span className="text-xs font-medium text-sage-400">{entries.length}</span>
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input mb-3"
            placeholder="Search entries…"
          />

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sage-300/70 px-4 py-10 text-center dark:border-white/15">
              <p className="font-display text-base text-sage-700 dark:text-sage-200">
                {entries.length === 0 ? "Your first page is waiting" : "No matches"}
              </p>
              <p className="mt-1 text-sm text-sage-500">
                Entries stay private on Safely.
              </p>
            </div>
          ) : (
            <ol className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
              {filtered.map((entry, i) => {
                const open = openId === entry.id;
                const editing = editingId === entry.id;
                const moodOpt = entry.mood
                  ? MOOD_OPTIONS.find((o) => o.value === entry.mood)
                  : null;
                return (
                  <li
                    key={entry.id}
                    className="animate-fade-in rounded-2xl bg-gradient-to-br from-white/90 to-brand-50/40 p-4 dark:from-white/[0.06] dark:to-brand-500/10"
                    style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : entry.id)}
                        className="text-left"
                      >
                        <time className="text-[11px] font-semibold uppercase tracking-wider text-brand-700/80 dark:text-brand-300">
                          {format(new Date(entry.createdAt), "MMM d · h:mm a")}
                        </time>
                      </button>
                      <div className="flex items-center gap-1">
                        {moodOpt && <span className="text-sm">{moodOpt.emoji}</span>}
                        <button
                          type="button"
                          className="btn-ghost rounded-full p-1.5"
                          aria-label="Edit entry"
                          onClick={() => startEdit(entry)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="btn-ghost rounded-full p-1.5 text-rose-500"
                          aria-label="Delete entry"
                          onClick={() => remove(entry.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {editing ? (
                      <div className="mt-3 space-y-2">
                        <input
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          className="input text-sm"
                          placeholder="Prompt (optional)"
                        />
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={6}
                          className="input min-h-[8rem] resize-y font-display text-sm leading-relaxed"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={pending}
                            className="btn-primary py-2 text-sm"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="btn-secondary py-2 text-sm"
                          >
                            <X className="h-3.5 w-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : entry.id)}
                        className="mt-2 w-full text-left"
                      >
                        {entry.prompt && (
                          <p className="line-clamp-2 font-display text-sm font-medium text-sage-800 dark:text-sage-100">
                            {entry.prompt}
                          </p>
                        )}
                        <p
                          className={cn(
                            "mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-sage-600 dark:text-sage-300",
                            open ? "" : "line-clamp-4"
                          )}
                        >
                          {entry.content}
                        </p>
                        <p className="mt-1.5 text-[10px] text-sage-400">
                          {open ? "Tap to collapse" : "Tap to read · edit anytime"}
                        </p>
                      </button>
                    )}
                  </li>
                );
              })}
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

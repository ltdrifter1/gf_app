"use client";

import { useMemo, useState, useTransition, useCallback, useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  Shuffle,
  Feather,
  Lock,
  Check,
  Trash2,
  Plus,
  Flame,
} from "lucide-react";
import {
  JOURNEY_STAGES,
  MOOD_OPTIONS,
  journeyStageLabel,
  promptsForJourneyStage,
  type JourneyStageSlug,
} from "@/lib/constants";
import { addJournal, deleteJournal, logMood, updateJournal } from "@/lib/actions/wellness";
import {
  dayLabel,
  findTodayEntry,
  firstLine,
  journalStreakDays,
} from "@/lib/journal";
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

function pickPrompt(prompts: string[], avoid?: string) {
  if (prompts.length === 0) return "";
  if (prompts.length === 1) return prompts[0];
  let next = prompts[Math.floor(Math.random() * prompts.length)];
  if (!avoid) return next;
  let guard = 0;
  while (next === avoid && guard++ < 8) {
    next = prompts[Math.floor(Math.random() * prompts.length)];
  }
  return next;
}

export function JournalStudio({
  initialEntries,
  journeyStage = "newly-diagnosed",
  todayMood = null,
  hasMoodToday = false,
}: {
  initialEntries: JournalEntryView[];
  journeyStage?: string | null;
  /** Latest Track mood logged today — seeds the journal mood strip */
  todayMood?: number | null;
  hasMoodToday?: boolean;
}) {
  const stage = (
    JOURNEY_STAGES.some((s) => s.slug === journeyStage)
      ? journeyStage
      : "newly-diagnosed"
  ) as JourneyStageSlug;
  const prompts = useMemo(() => promptsForJourneyStage(stage), [stage]);

  const [entries, setEntries] = useState(initialEntries);
  const [activeId, setActiveId] = useState<string | "new">("new");
  const [prompt, setPrompt] = useState(() => pickPrompt(prompts));
  const [content, setContent] = useState("");
  const [entryMood, setEntryMood] = useState<number | null>(todayMood);
  const [moodSyncedToday, setMoodSyncedToday] = useState(hasMoodToday);
  const [pending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [dirty, setDirty] = useState(false);
  const booted = useRef(false);
  const writerRef = useRef<HTMLTextAreaElement>(null);

  const todayEntry = useMemo(() => findTodayEntry(entries), [entries]);
  const streak = useMemo(() => journalStreakDays(entries), [entries]);
  const activeEntry = activeId === "new" ? null : entries.find((e) => e.id === activeId) ?? null;
  const isToday = Boolean(activeEntry && todayEntry && activeEntry.id === todayEntry.id);
  const isContinuingToday = activeId === "new" ? !todayEntry : isToday;

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

  const loadEntry = useCallback((entry: JournalEntryView) => {
    setActiveId(entry.id);
    setContent(entry.content);
    setPrompt(entry.prompt || pickPrompt(prompts));
    setEntryMood(entry.mood ?? todayMood);
    setDirty(false);
    setError(null);
  }, [prompts, todayMood]);

  const startFresh = useCallback(() => {
    setActiveId("new");
    setContent("");
    setPrompt(pickPrompt(prompts));
    setEntryMood(todayMood);
    setDirty(false);
    setError(null);
    requestAnimationFrame(() => writerRef.current?.focus());
  }, [prompts, todayMood]);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const today = findTodayEntry(initialEntries);
    if (today) {
      loadEntry(today);
    } else {
      setEntryMood(todayMood);
    }
  }, [initialEntries, loadEntry, todayMood]);

  const shufflePrompt = useCallback(() => {
    setPrompt((prev) => pickPrompt(prompts, prev));
    setDirty(true);
  }, [prompts]);

  function openEntry(entry: JournalEntryView) {
    if (dirty && content.trim() && !window.confirm("Discard unsaved changes?")) return;
    loadEntry(entry);
    writerRef.current?.focus();
  }

  function newEntry() {
    if (dirty && content.trim() && !window.confirm("Discard unsaved changes?")) return;
    startFresh();
  }

  async function syncMoodToTrack(mood: number) {
    if (moodSyncedToday) return;
    const fd = new FormData();
    fd.set("mood", String(mood));
    const result = await logMood(fd);
    if (!result?.error) setMoodSyncedToday(true);
  }

  function save() {
    const body = content.trim();
    if (!body) {
      setError("Write a few words first");
      return;
    }
    setError(null);
    startTransition(async () => {
      if (activeId !== "new") {
        const fd = new FormData();
        fd.set("id", activeId);
        fd.set("content", body);
        fd.set("prompt", prompt);
        if (entryMood) fd.set("mood", String(entryMood));
        else fd.set("clearMood", "true");
        const result = await updateJournal(fd);
        if (result?.error) {
          setError(result.error);
          return;
        }
        if (result?.entry) {
          setEntries((prev) => prev.map((e) => (e.id === result.entry!.id ? result.entry! : e)));
          setActiveId(result.entry.id);
        }
      } else {
        const fd = new FormData();
        fd.set("prompt", prompt);
        fd.set("content", body);
        if (entryMood) fd.set("mood", String(entryMood));
        const result = await addJournal(fd);
        if (result?.error) {
          setError(result.error);
          return;
        }
        if (result?.entry) {
          setEntries((prev) => [result.entry!, ...prev]);
          setActiveId(result.entry.id);
        }
      }

      if (entryMood) await syncMoodToTrack(entryMood);

      setDirty(false);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1800);
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
      if (activeId === id) startFresh();
    });
  }

  const statusLine = isContinuingToday
    ? todayEntry || activeId !== "new"
      ? "Continuing today"
      : "Today’s entry"
    : activeEntry
      ? dayLabel(activeEntry.createdAt)
      : "New entry";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.75fr)]">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/40 bg-white/55 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1715]/80">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(ellipse_at_20%_0%,rgba(13,148,136,0.14),transparent_60%)]" />

        <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-sage-200/50 px-5 py-3.5 sm:px-7 dark:border-white/10">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-sage-500">
              <Feather className="h-3.5 w-3.5 text-brand-600" />
              {statusLine}
            </span>
            {streak > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-200">
                <Flame className="h-3 w-3" />
                {streak}-day streak
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-sage-400">
            <Lock className="h-3 w-3" /> Only you
          </span>
        </div>

        <div className="relative space-y-4 px-5 py-5 sm:px-7 sm:py-6">
          <div>
            <p className="mb-1.5 text-xs font-medium text-sage-500">
              Prompts for{" "}
              <span className="font-semibold text-brand-700 dark:text-brand-300">
                {journeyStageLabel(stage)}
              </span>
              <span className="text-sage-400">
                {" "}
                ·{" "}
                <a href="/app/profile" className="underline hover:text-brand-600">
                  change in profile
                </a>
              </span>
            </p>
            <div className="flex items-start justify-between gap-3">
              <p className="font-display text-[1.35rem] font-semibold leading-snug tracking-tight text-sage-900 dark:text-white sm:text-[1.55rem]">
                {prompt}
              </p>
              <button
                type="button"
                onClick={shufflePrompt}
                className="btn-ghost shrink-0 rounded-full p-2.5"
                title="Another prompt"
                aria-label="Shuffle prompt"
              >
                <Shuffle className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {prompts.slice(0, 3).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPrompt(p);
                    setDirty(true);
                  }}
                  className={cn(
                    "max-w-full truncate rounded-full px-2.5 py-1 text-[11px] font-medium transition",
                    p === prompt
                      ? "bg-sage-900 text-white dark:bg-white dark:text-sage-900"
                      : "bg-white/70 text-sage-600 hover:bg-white dark:bg-white/5 dark:text-sage-300"
                  )}
                >
                  {p.length > 36 ? `${p.slice(0, 36)}…` : p}
                </button>
              ))}
            </div>
          </div>

          <textarea
            ref={writerRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setDirty(true);
              if (error) setError(null);
            }}
            rows={14}
            placeholder="Write freely. No audience. No edits required."
            className="w-full resize-none rounded-3xl border border-sage-200/70 bg-white/80 px-5 py-5 font-display text-lg leading-relaxed text-sage-900 outline-none transition placeholder:text-sage-400 focus:border-brand-400/50 focus:ring-4 focus:ring-brand-400/15 dark:border-white/10 dark:bg-black/20 dark:text-sage-50 dark:placeholder:text-sage-500"
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-sage-400">
              Mood{moodSyncedToday || todayMood ? " · from today" : ""}
            </span>
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => {
                  setEntryMood((prev) => (prev === m.value ? null : m.value));
                  setDirty(true);
                }}
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
            <span className="text-[11px] text-sage-400">
              Saves to Track trends too
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-sage-400">
              {wordCount === 0
                ? "Start anywhere"
                : `${wordCount} word${wordCount === 1 ? "" : "s"}${dirty ? " · unsaved" : ""}`}
            </p>
            <div className="flex items-center gap-2">
              {activeId !== "new" && (
                <button
                  type="button"
                  onClick={() => remove(activeId)}
                  disabled={pending}
                  className="btn-ghost rounded-full px-3 py-2 text-rose-500"
                  aria-label="Delete entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
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
                {pending ? "Saving…" : activeId === "new" && !todayEntry ? "Save today" : "Save"}
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

      <aside className="space-y-3" id="journal-index">
        <div className="rounded-[1.75rem] border border-white/40 bg-white/55 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1715]/80 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-semibold text-sage-900 dark:text-white">
              Entries
            </h2>
            <button
              type="button"
              onClick={newEntry}
              className="btn-secondary rounded-full px-3 py-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          </div>

          {todayEntry && activeId !== todayEntry.id && (
            <button
              type="button"
              onClick={() => openEntry(todayEntry)}
              className="mb-3 w-full rounded-2xl bg-safely-gradient px-3.5 py-2.5 text-left text-sm font-semibold text-white shadow-glow transition hover:brightness-105"
            >
              Continue today
            </button>
          )}

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input mb-3 py-2 text-sm"
            placeholder="Search…"
          />

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sage-300/70 px-4 py-8 text-center dark:border-white/15">
              <p className="font-display text-sm text-sage-700 dark:text-sage-200">
                {entries.length === 0 ? "Your first page is waiting" : "No matches"}
              </p>
            </div>
          ) : (
            <ol className="max-h-[min(28rem,55vh)] space-y-1 overflow-y-auto pr-0.5 lg:max-h-[36rem]">
              {filtered.map((entry) => {
                const active = activeId === entry.id;
                const moodOpt = entry.mood
                  ? MOOD_OPTIONS.find((o) => o.value === entry.mood)
                  : null;
                const today = todayEntry?.id === entry.id;
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => openEntry(entry)}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-2xl px-3 py-2.5 text-left transition",
                        active
                          ? "bg-brand-50 ring-1 ring-brand-300/40 dark:bg-brand-500/15 dark:ring-brand-400/30"
                          : "hover:bg-white/70 dark:hover:bg-white/5"
                      )}
                    >
                      <span className="mt-0.5 w-4 shrink-0 text-center text-sm leading-none">
                        {moodOpt?.emoji ?? "·"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-sage-500">
                            {dayLabel(entry.createdAt)}
                          </span>
                          {today && (
                            <span className="rounded-full bg-brand-500/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                              Today
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block truncate text-sm font-medium text-sage-800 dark:text-sage-100">
                          {entry.prompt
                            ? entry.prompt.length > 48
                              ? `${entry.prompt.slice(0, 48)}…`
                              : entry.prompt
                            : firstLine(entry.content)}
                        </span>
                        {entry.prompt && (
                          <span className="mt-0.5 block truncate text-xs text-sage-500">
                            {firstLine(entry.content, 56)}
                          </span>
                        )}
                      </span>
                    </button>
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

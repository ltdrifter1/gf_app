"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { HeartPulse, Lock, MessageCircle, Trash2 } from "lucide-react";
import { HEALTH_LOG_KINDS, MOOD_OPTIONS, SEVERITY_LABELS } from "@/lib/constants";
import { addHealthLog, deleteHealthLog } from "@/lib/actions/wellness";
import { MoodCheckIn, MoodTrend, type MoodEntryView } from "@/components/wellness-widgets";
import { cn, timeAgo } from "@/lib/utils";

export type HealthLogView = {
  id: string;
  kind: string;
  severity: number;
  note: string | null;
  createdAt: string;
};

export function HealthTrackPanel({
  initialMoods,
  initialLogs,
}: {
  initialMoods: MoodEntryView[];
  initialLogs: HealthLogView[];
}) {
  const [moods, setMoods] = useState(initialMoods);
  const [logs, setLogs] = useState(initialLogs);
  const [kind, setKind] = useState<string>("glutening");
  const [severity, setSeverity] = useState(3);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [companion, setCompanion] = useState<{
    href: string;
    tipHref: string;
    message: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function saveLog() {
    setError(null);
    const fd = new FormData();
    fd.set("kind", kind);
    fd.set("severity", String(severity));
    if (note.trim()) fd.set("note", note.trim());
    startTransition(async () => {
      const result = await addHealthLog(fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.entry) {
        setLogs((prev) => [result.entry!, ...prev]);
      }
      setCompanion(result?.companion ?? null);
      setNote("");
    });
  }

  function removeLog(id: string) {
    if (!window.confirm("Delete this private log?")) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      const result = await deleteHealthLog(fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setLogs((prev) => prev.filter((l) => l.id !== id));
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="space-y-4 rounded-[1.75rem] border border-white/40 bg-white/55 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1715]/80 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-sage-900 dark:text-white">
              Mood check-in
            </h2>
            <p className="mt-1 text-sm text-sage-500">Private by default. Trends stay on this tab.</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sage-400">
            <Lock className="h-3 w-3" /> You only
          </span>
        </div>
        <MoodCheckIn onLogged={(entry) => setMoods((prev) => [entry, ...prev])} />
        <div className="border-t border-sage-200/60 pt-4 dark:border-white/10">
          <h3 className="mb-3 font-display text-base font-semibold text-sage-900 dark:text-white">
            14-day mood trend
          </h3>
          <MoodTrend entries={moods} />
        </div>
      </section>

      <section className="space-y-4 rounded-[1.75rem] border border-white/40 bg-white/55 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1715]/80 sm:p-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-900 dark:text-white">
            Glutening & symptoms
          </h2>
          <p className="mt-1 text-sm text-sage-500">
            Log exposures and flares for your care team — never shown publicly.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {HEALTH_LOG_KINDS.map((k) => (
            <button
              key={k.slug}
              type="button"
              onClick={() => setKind(k.slug)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-semibold transition",
                kind === k.slug
                  ? "bg-sage-900 text-white dark:bg-white dark:text-sage-900"
                  : "bg-white/70 text-sage-600 hover:bg-white dark:bg-white/5 dark:text-sage-300"
              )}
            >
              {k.label}
            </button>
          ))}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-sage-400">
            Severity · {SEVERITY_LABELS[severity - 1]}
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSeverity(n)}
                className={cn(
                  "flex h-10 flex-1 items-center justify-center rounded-xl text-sm font-bold transition",
                  severity === n
                    ? "bg-brand-600 text-white"
                    : "bg-white/70 text-sage-600 hover:bg-white dark:bg-white/5 dark:text-sage-300"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input min-h-[5rem] resize-y"
          placeholder="What happened? Foods, place, symptoms…"
          maxLength={280}
        />

        <button
          type="button"
          onClick={saveLog}
          disabled={pending}
          className="btn-primary w-full"
        >
          {pending ? "Saving…" : "Save private log"}
        </button>
        {error && (
          <p className="text-sm text-rose-600" role="alert">
            {error}
          </p>
        )}

        {companion && (
          <div className="rounded-2xl border border-brand-200/70 bg-brand-50/80 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
            <p className="text-sm font-medium text-sage-800 dark:text-sage-100">{companion.message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={companion.tipHref} className="btn-secondary text-sm">
                <HeartPulse className="h-4 w-4" /> Recovery tips
              </Link>
              <Link href={companion.href} className="btn-primary text-sm">
                <MessageCircle className="h-4 w-4" /> Talk it out
              </Link>
            </div>
          </div>
        )}

        <div className="border-t border-sage-200/60 pt-4 dark:border-white/10">
          <h3 className="mb-3 font-display text-base font-semibold text-sage-900 dark:text-white">
            Recent logs
          </h3>
          {logs.length === 0 ? (
            <p className="text-sm text-sage-500">No logs yet. Start after a rough meal or flare.</p>
          ) : (
            <ol className="max-h-72 space-y-2 overflow-y-auto">
              {logs.map((log) => {
                const kindMeta = HEALTH_LOG_KINDS.find((k) => k.slug === log.kind);
                return (
                  <li
                    key={log.id}
                    className="flex items-start gap-3 rounded-2xl bg-white/70 p-3 dark:bg-white/5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-sage-900 dark:text-white">
                        {kindMeta?.label ?? log.kind}
                        <span className="ml-2 font-normal text-sage-500">
                          · {SEVERITY_LABELS[log.severity - 1] ?? log.severity}
                        </span>
                      </p>
                      {log.note && (
                        <p className="mt-0.5 text-sm text-sage-600 dark:text-sage-300">{log.note}</p>
                      )}
                      <p className="mt-1 text-[11px] text-sage-400">
                        {format(new Date(log.createdAt), "MMM d · h:mm a")} · {timeAgo(log.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-ghost rounded-full p-1.5 text-rose-500"
                      aria-label="Delete log"
                      onClick={() => removeLog(log.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {moods[0] && (
          <p className="text-xs text-sage-400">
            Latest mood: {MOOD_OPTIONS.find((o) => o.value === moods[0].mood)?.label ?? "—"}{" "}
            ({timeAgo(moods[0].createdAt)})
          </p>
        )}
      </section>
    </div>
  );
}

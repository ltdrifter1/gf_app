"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, HeartPulse, X } from "lucide-react";
import { logGluteningRecovery, setPanicBuddy } from "@/lib/actions/recovery";
import { SEVERITY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type BuddyOption = { id: string; name: string };

export function RecoveryCard({
  buddies,
  panicBuddyId,
  onClose,
}: {
  buddies: BuddyOption[];
  panicBuddyId: string | null;
  onClose?: () => void;
}) {
  const [log, setLog] = useState(true);
  const [nudge, setNudge] = useState(false);
  const [severity, setSeverity] = useState(3);
  const [note, setNote] = useState("");
  const [buddyId, setBuddyId] = useState(panicBuddyId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    start(async () => {
      if (buddyId !== (panicBuddyId ?? "")) {
        await setPanicBuddy(buddyId || null);
      }
      const fd = new FormData();
      if (log) fd.set("log", "true");
      if (nudge) fd.set("nudge", "true");
      fd.set("severity", String(severity));
      if (note.trim()) fd.set("note", note.trim());
      const res = await logGluteningRecovery(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setDone(
        res?.nudged
          ? "Logged privately. Your buddy got a check-in with no details."
          : log
            ? "Logged privately. This stays on your Health log — never public."
            : "Recovery card noted. Nothing was stored unless you ticked the log."
      );
    });
  }

  return (
    <div className="card relative max-w-lg space-y-4 p-5">
      {onClose && (
        <button type="button" className="btn-ghost absolute right-2 top-2 p-1.5" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      )}
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">
          <HeartPulse className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
            I got gluten
          </h2>
          <p className="text-sm text-sage-500">A private recovery card. Not a diagnosis. Not medical advice.</p>
        </div>
      </div>

      <ul className="space-y-2 text-sm text-sage-700 dark:text-sage-200">
        <li>
          <strong>Hydrate</strong> — water, broth, or whatever you keep down. Small sips count.
        </li>
        <li>
          <strong>Rest</strong> — skip the hero workout. Sleep and a heating pad are allowed.
        </li>
        <li>
          <strong>Next 24–48h</strong> — favour foods you already trust. Maybe skip new restaurants, alcohol, and
          shared fryers until you feel steadier.
        </li>
        <li>
          <strong>Reach out</strong> — if symptoms are severe, worsening, or you feel unsafe, contact your care team
          or local emergency services. A buddy hello is optional and shares no details.
        </li>
      </ul>

      <p className="rounded-xl bg-amber-50/80 px-3 py-2 text-[11px] text-sage-700 dark:bg-amber-500/10 dark:text-sage-200">
        <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
        Educational support only. Safely does not diagnose or treat. Confirm care with a clinician who knows you.
      </p>

      {done ? (
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{done}</p>
      ) : (
        <>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={log} onChange={(e) => setLog(e.target.checked)} />
            Save a private glutening log (never public)
          </label>
          {log && (
            <div>
              <p className="mb-1 text-xs text-sage-500">Severity · {SEVERITY_LABELS[severity - 1]}</p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSeverity(n)}
                    className={cn(
                      "h-9 flex-1 rounded-xl text-sm font-bold",
                      severity === n ? "bg-brand-600 text-white" : "bg-white/70 dark:bg-white/5"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={280}
                placeholder="Optional private note — foods, place, how you feel…"
                className="input mt-2 min-h-[4rem]"
              />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={nudge} onChange={(e) => setNudge(e.target.checked)} />
            Nudge a chosen buddy (no details shared)
          </label>
          {nudge && (
            <select
              className="input"
              value={buddyId}
              onChange={(e) => setBuddyId(e.target.value)}
            >
              <option value="">Pick a buddy…</option>
              {buddies.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {error && (
            <p className="text-sm text-rose-600" role="alert">
              {error}
            </p>
          )}
          <button type="button" className="btn-primary w-full" disabled={pending} onClick={submit}>
            {pending ? "Saving…" : "I've got this — save"}
          </button>
        </>
      )}
    </div>
  );
}

export function RecoveryLauncher({
  buddies,
  panicBuddyId,
  compact = false,
}: {
  buddies: BuddyOption[];
  panicBuddyId: string | null;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={compact ? "btn-ghost px-2 py-1 text-[11px] text-rose-700 dark:text-rose-300" : "btn-secondary text-sm"}
      >
        I got gluten
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
          <RecoveryCard buddies={buddies} panicBuddyId={panicBuddyId} onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}

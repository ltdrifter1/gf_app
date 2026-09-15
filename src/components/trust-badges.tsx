import { cn } from "@/lib/utils";
import type { TrustBadge, TrustRollup } from "@/lib/dining-confidence";

function toneClass(tone: TrustBadge["tone"]) {
  if (tone === "good") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200";
  if (tone === "warn") return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200";
  if (tone === "bad") return "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200";
  return "bg-sage-100 text-sage-600 dark:bg-white/10 dark:text-sage-300";
}

export function TrustBadges({ badges, className }: { badges: TrustBadge[]; className?: string }) {
  if (badges.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((b) => (
        <span key={b.key} className={cn("chip", toneClass(b.tone))}>
          {b.label}
        </span>
      ))}
    </div>
  );
}

export function ConfidenceMeter({
  confidence,
  label = "Community confidence",
  compact = false,
}: {
  confidence: number;
  label?: string;
  compact?: boolean;
}) {
  const color =
    confidence >= 75 ? "bg-emerald-500" : confidence >= 50 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className={compact ? "min-w-[7rem]" : ""}>
      <div className="flex items-center justify-between gap-2 text-[11px] text-sage-500">
        <span>{label}</span>
        <span className="font-semibold tabular-nums text-sage-800 dark:text-sage-100">{confidence}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-sage-200/80 dark:bg-white/10">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.max(4, confidence)}%` }} />
      </div>
    </div>
  );
}

export function TrustChecklist({ rollup }: { rollup: TrustRollup }) {
  return (
    <div className="space-y-3">
      <ConfidenceMeter confidence={rollup.confidence} />
      <TrustBadges badges={rollup.badges} />
      <ul className="space-y-1.5 text-xs text-sage-600 dark:text-sage-300">
        {rollup.checklist.map((c) => (
          <li key={c.key} className="flex justify-between gap-3">
            <span>{c.label}</span>
            <span>
              {c.yes} yes · {c.no} no
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-sage-400">
        Rollup from structured visit checklists. Recent reviews weigh more. Not a health inspection.
      </p>
    </div>
  );
}

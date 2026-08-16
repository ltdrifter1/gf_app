"use client";

import { useState, useTransition } from "react";
import { completeOnboarding, skipOnboarding } from "@/lib/actions/onboarding";
import { JOURNEY_STAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const DIAGNOSES = [
  { value: "celiac", label: "Celiac disease" },
  { value: "gluten-intolerance", label: "Gluten intolerance" },
  { value: "supporter", label: "Family / supporter" },
  { value: "unspecified", label: "Prefer not to say" },
];

type Goal = { slug: string; label: string; hint: string };

export function OnboardingForm({
  defaultDiagnosis,
  defaultJourneyStage,
  defaultLocation,
  goals,
}: {
  defaultDiagnosis: string;
  defaultJourneyStage?: string;
  defaultLocation: string;
  goals: Goal[];
}) {
  const [selected, setSelected] = useState<string[]>(["dining", "newly-diagnosed"]);
  const [journeyStage, setJourneyStage] = useState(
    defaultJourneyStage || "newly-diagnosed"
  );
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function toggle(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function onSubmit(formData: FormData) {
    for (const g of selected) formData.append("goals", g);
    formData.set("journeyStage", journeyStage);
    startTransition(async () => {
      const res = await completeOnboarding(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={onSubmit} className="card space-y-5 p-5 sm:p-6">
      <div>
        <p className="mb-2 text-sm font-medium text-sage-700 dark:text-sage-200">
          Where are you in your journey?
        </p>
        <div className="space-y-2">
          {JOURNEY_STAGES.map((s) => {
            const on = journeyStage === s.slug;
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => setJourneyStage(s.slug)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition",
                  on
                    ? "border-brand-300 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/15"
                    : "border-sage-200/70 bg-white/60 dark:border-white/10 dark:bg-white/5"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                    on
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-sage-300 text-transparent"
                  )}
                >
                  ✓
                </span>
                <span>
                  <span className="block font-semibold text-sage-900 dark:text-white">
                    {s.label}
                  </span>
                  <span className="text-xs text-sage-500">{s.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">
          Diagnosis (optional)
        </label>
        <select name="diagnosis" className="input" defaultValue={defaultDiagnosis}>
          {DIAGNOSES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">
          Your city
        </label>
        <input
          name="location"
          required
          className="input"
          placeholder="Austin, TX"
          defaultValue={defaultLocation}
        />
        <p className="mt-1 text-xs text-sage-400">Used for near-you dining and local matches.</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-sage-700 dark:text-sage-200">
          What do you need most right now?
        </p>
        <div className="space-y-2">
          {goals.map((g) => {
            const on = selected.includes(g.slug);
            return (
              <button
                key={g.slug}
                type="button"
                onClick={() => toggle(g.slug)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition",
                  on
                    ? "border-brand-300 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/15"
                    : "border-sage-200/70 bg-white/60 dark:border-white/10 dark:bg-white/5"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                    on
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-sage-300 text-transparent"
                  )}
                >
                  ✓
                </span>
                <span>
                  <span className="block font-semibold text-sage-900 dark:text-white">
                    {g.label}
                  </span>
                  <span className="text-xs text-sage-500">{g.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
        {pending ? "Matching…" : "Show my matches"}
      </button>

      <button
        type="button"
        className="w-full text-center text-sm text-sage-500 hover:underline"
        onClick={() => startTransition(() => skipOnboarding())}
      >
        Skip for now
      </button>
    </form>
  );
}

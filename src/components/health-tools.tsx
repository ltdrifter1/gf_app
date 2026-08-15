"use client";

import { useEffect, useState } from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = { title: string; detail: string };

const TOOLS: Record<
  string,
  {
    title: string;
    intro: string;
    steps?: Step[];
    checklist?: string[];
    breathing?: boolean;
  }
> = {
  "eating-out-spiral": {
    title: "Eating-out grounding",
    intro: "Move through each step slowly. You can stop anytime.",
    steps: [
      {
        title: "Breathe",
        detail: "In for 4, out for 4 — three rounds. Feel your feet on the floor.",
      },
      {
        title: "Plan",
        detail: "Choose one safer spot or one dish you can verify. One decision is enough.",
      },
      {
        title: "Ask",
        detail:
          'Say: "I have celiac. Can this be prepared without gluten cross-contact?"',
      },
      {
        title: "Soften",
        detail: "One careful meal is enough. Leaving is allowed if it doesn't feel right.",
      },
    ],
  },
  "anxiety-toolkit": {
    title: "Anxiety toolkit",
    intro: "Pick one tool for the next few minutes — not all of them.",
    breathing: true,
    steps: [
      {
        title: "Worry window",
        detail: "Park food fears for a 10-minute slot later. Outside that window, gently redirect.",
      },
      {
        title: "Safe-foods anchor",
        detail: "Name five meals you trust at home. Proof that safety already exists.",
      },
    ],
  },
  "glutening-checklist": {
    title: "After glutening",
    intro: "Check off what you’ve done. Shame optional — rest required.",
    checklist: [
      "Stopped further exposure",
      "Hydrated and rested",
      "Stuck to known-safe simple foods",
      "Logged severity on Track",
      "Skipped hard workouts if depleted",
      "Contacted doctor if severe or not easing",
    ],
  },
  "labs-checklist": {
    title: "Labs to discuss",
    intro: "Educational only — your clinician decides what’s right for you.",
    checklist: [
      "tTG-IgA (and total IgA)",
      "CBC",
      "Ferritin",
      "Vitamin D",
      "Vitamin B12",
      "Folate",
      "Bone density (if indicated)",
    ],
  },
};

function BoxBreathing() {
  const phases = ["Inhale", "Hold", "Exhale", "Hold"] as const;
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setPhase((p) => {
        const next = (p + 1) % 4;
        if (next === 0) setCycle((c) => c + 1);
        return next;
      });
    }, 4000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (cycle >= 4) {
      setRunning(false);
      setPhase(0);
      setCycle(0);
    }
  }, [cycle]);

  return (
    <div className="rounded-2xl bg-brand-500/10 p-4">
      <p className="text-sm font-semibold text-sage-800 dark:text-sage-100">Box breathing</p>
      <p className="mt-1 text-sm text-sage-500">4 · 4 · 4 · 4 — four cycles</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="font-display text-2xl font-semibold text-sage-900 dark:text-white">
          {running ? phases[phase] : "Ready"}
        </p>
        <button
          type="button"
          className="btn-primary py-2 text-sm"
          onClick={() => {
            setCycle(0);
            setPhase(0);
            setRunning((r) => !r);
          }}
        >
          {running ? "Stop" : "Start"}
        </button>
      </div>
      {running && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/50 dark:bg-white/10">
          <div
            key={`${cycle}-${phase}`}
            className="h-full origin-left bg-brand-600 transition-none"
            style={{
              width: "100%",
              transform: "scaleX(0)",
              animation: "safelyGrowBar 4s linear forwards",
            }}
          />
        </div>
      )}
      {cycle > 0 && !running && (
        <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-300">Nice work — four cycles done.</p>
      )}
    </div>
  );
}

function StepWalkthrough({ steps }: { steps: Step[] }) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              "h-2 flex-1 rounded-full transition",
              i <= index ? "bg-brand-600" : "bg-sage-200 dark:bg-white/10"
            )}
            aria-label={`Step ${i + 1}`}
          />
        ))}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-sage-400">
          Step {index + 1} of {steps.length}
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold text-sage-900 dark:text-white">
          {step.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-sage-600 dark:text-sage-300">{step.detail}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-secondary"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Back
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={index >= steps.length - 1}
          onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function LocalChecklist({ items }: { items: string[] }) {
  const [done, setDone] = useState<Record<number, boolean>>({});
  const count = Object.values(done).filter(Boolean).length;
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-sage-400">
        {count}/{items.length} checked · saved on this device only
      </p>
      <ul className="space-y-2">
        {items.map((item, i) => {
          const on = !!done[i];
          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left text-sm transition",
                  on
                    ? "bg-brand-500/10 text-sage-800 dark:text-sage-100"
                    : "bg-white/60 text-sage-700 hover:bg-white dark:bg-white/5 dark:text-sage-200"
                )}
              >
                {on ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-sage-400" />
                )}
                <span className={cn(on && "line-through opacity-70")}>{item}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function HealthTool({ toolKey }: { toolKey: string }) {
  const tool = TOOLS[toolKey];
  if (!tool) return null;

  return (
    <div className="rounded-[1.5rem] border border-brand-400/20 bg-gradient-to-br from-brand-500/10 to-transparent p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700/80 dark:text-brand-300">
        Interactive
      </p>
      <h2 className="mt-1 font-display text-lg font-semibold text-sage-900 dark:text-white">
        {tool.title}
      </h2>
      <p className="mt-1 text-sm text-sage-500">{tool.intro}</p>
      <div className="mt-4 space-y-4">
        {tool.breathing && <BoxBreathing />}
        {tool.steps && <StepWalkthrough steps={tool.steps} />}
        {tool.checklist && <LocalChecklist items={tool.checklist} />}
      </div>
    </div>
  );
}

"use client";

import { useRef, useState, useTransition } from "react";
import { StarRating } from "./star-rating";
import { addRestaurantReview } from "@/lib/actions/reviews";
import { cn } from "@/lib/utils";

const CHECKLIST = [
  { name: "observedDedicatedKitchen", label: "Dedicated kitchen" },
  { name: "observedDedicatedFryer", label: "Dedicated fryer" },
  { name: "observedSeparatePrep", label: "Separate prep / tools" },
  { name: "observedLabeledMenu", label: "Clearly labeled GF menu" },
  { name: "observedStaffUnderstood", label: "Staff understood celiac" },
] as const;

function TriState({ name, label }: { name: string; label: string }) {
  const [value, setValue] = useState<"unset" | "yes" | "no">("unset");
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 px-3 py-2 dark:bg-white/5">
      <span className="text-sm text-sage-700 dark:text-sage-200">{label}</span>
      <div className="flex gap-1">
        <input type="hidden" name={name} value={value === "unset" ? "" : value} />
        {(["yes", "no"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setValue((v) => (v === opt ? "unset" : opt))}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
              value === opt
                ? opt === "yes"
                  ? "bg-emerald-500 text-white"
                  : "bg-rose-500 text-white"
                : "bg-sage-100 text-sage-500 dark:bg-white/10 dark:text-sage-300"
            )}
          >
            {opt === "yes" ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RestaurantReviewForm({ restaurantId }: { restaurantId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [incident, setIncident] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await addRestaurantReview(restaurantId, formData);
      if (res?.error) setError(res.error);
      else {
        setError("");
        setIncident(false);
        ref.current?.reset();
      }
    });
  }

  return (
    <form ref={ref} action={onSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <p className="mb-1 text-xs font-medium text-sage-500">Overall</p>
          <StarRating name="rating" />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-sage-500">GF safety</p>
          <StarRating name="safetyRating" />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-sage-500">
          What did you observe? (builds trust scores)
        </p>
        <div className="space-y-2">
          {CHECKLIST.map((c) => (
            <TriState key={c.name} name={c.name} label={c.label} />
          ))}
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-2xl border border-rose-200/70 bg-rose-50/70 px-3 py-3 dark:border-rose-500/20 dark:bg-rose-500/10">
        <input
          type="checkbox"
          name="crossContactIncident"
          checked={incident}
          onChange={(e) => setIncident(e.target.checked)}
          className="mt-1"
        />
        <span>
          <span className="block text-sm font-semibold text-rose-700 dark:text-rose-300">
            I had a cross-contact / glutening incident here
          </span>
          <span className="text-xs text-rose-600/80 dark:text-rose-300/80">
            This heavily lowers community confidence.
          </span>
        </span>
      </label>

      <textarea
        name="content"
        required
        rows={3}
        className="input resize-none"
        placeholder="How was the gluten-free experience? Any cross-contamination concerns?"
      />

      <div>
        <label className="mb-1 block text-xs font-medium text-sage-500">
          Evidence photo URL (menu, kitchen, packaging — optional)
        </label>
        <input
          name="evidenceUrl"
          type="url"
          className="input"
          placeholder="https://…"
        />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Submitting…" : "Post safety review"}
      </button>
    </form>
  );
}

"use client";

import { useRef, useState, useTransition } from "react";
import { StarRating } from "./star-rating";
import { rateRecipe, toggleSaveRecipe } from "@/lib/actions/reviews";
import { Bookmark } from "lucide-react";

export function RecipeRatingForm({ recipeId, saved }: { recipeId: string; saved: boolean }) {
  const [pending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(saved);
  const ref = useRef<HTMLFormElement>(null);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      await rateRecipe(recipeId, formData);
      ref.current?.reset();
    });
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => {
          setIsSaved((v) => !v);
          startTransition(() => toggleSaveRecipe(recipeId));
        }}
        className={`btn w-full px-5 py-2.5 ${isSaved ? "bg-brand-600 text-white" : "btn-secondary"}`}
      >
        <Bookmark className={`h-4 w-4 ${isSaved ? "fill-white" : ""}`} />
        {isSaved ? "Saved to collection" : "Save recipe"}
      </button>

      <form ref={ref} action={onSubmit} className="space-y-3">
        <p className="text-sm font-medium text-sage-700 dark:text-sage-200">Rate this recipe</p>
        <StarRating name="rating" />
        <textarea name="review" rows={2} className="input resize-none" placeholder="Add a quick note (optional)" />
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Saving…" : "Submit rating"}
        </button>
      </form>
    </div>
  );
}

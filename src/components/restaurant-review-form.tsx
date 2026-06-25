"use client";

import { useRef, useState, useTransition } from "react";
import { StarRating } from "./star-rating";
import { addRestaurantReview } from "@/lib/actions/reviews";

export function RestaurantReviewForm({ restaurantId }: { restaurantId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const ref = useRef<HTMLFormElement>(null);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await addRestaurantReview(restaurantId, formData);
      if (res?.error) setError(res.error);
      else {
        setError("");
        ref.current?.reset();
      }
    });
  }

  return (
    <form ref={ref} action={onSubmit} className="space-y-3">
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
      <textarea
        name="content"
        required
        rows={3}
        className="input resize-none"
        placeholder="How was the gluten-free experience? Any cross-contamination concerns?"
      />
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Submitting…" : "Post review"}
      </button>
    </form>
  );
}

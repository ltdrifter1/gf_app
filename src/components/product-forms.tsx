"use client";

import { useRef, useState, useTransition } from "react";
import { StarRating } from "./star-rating";
import { addProductReview, reportIngredientChange } from "@/lib/actions/reviews";
import { AlertTriangle } from "lucide-react";

export function ProductReviewForm({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      action={(fd) => startTransition(async () => { await addProductReview(productId, fd); ref.current?.reset(); })}
      className="space-y-3"
    >
      <StarRating name="rating" />
      <textarea name="content" required rows={2} className="input resize-none" placeholder="Share your experience with this product…" />
      <button type="submit" disabled={pending} className="btn-primary">{pending ? "Posting…" : "Post review"}</button>
    </form>
  );
}

export function IngredientReportForm({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  if (done) return <p className="text-sm text-emerald-600">Thanks! Our team will review this report. 🙏</p>;

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary w-full">
        <AlertTriangle className="h-4 w-4 text-amber-500" /> Report ingredient change
      </button>
    );

  return (
    <form
      ref={ref}
      action={(fd) => startTransition(async () => { const r = await reportIngredientChange(productId, fd); if (!r?.error) setDone(true); })}
      className="space-y-2"
    >
      <textarea name="description" required rows={3} className="input resize-none" placeholder="What changed? (e.g. now contains wheat starch)" />
      <button type="submit" disabled={pending} className="btn-primary w-full">{pending ? "Submitting…" : "Submit report"}</button>
    </form>
  );
}

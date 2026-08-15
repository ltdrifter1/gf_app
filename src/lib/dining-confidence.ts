/**
 * Community confidence from structured celiac safety reviews.
 * Recent reviews weigh more; cross-contact incidents penalize hard.
 * Half-life ≈ 90 days so stale praise doesn't outrank fresh warnings.
 */

export type ConfidenceReview = {
  safetyRating: number;
  crossContactIncident: boolean;
  createdAt: Date;
  observedDedicatedKitchen?: boolean | null;
  observedDedicatedFryer?: boolean | null;
  observedSeparatePrep?: boolean | null;
  observedLabeledMenu?: boolean | null;
  observedStaffUnderstood?: boolean | null;
};

const HALF_LIFE_DAYS = 90;

export function computeRestaurantConfidence(
  reviews: ConfidenceReview[],
  now = Date.now()
): { confidence: number; risk: number; lastReviewAt: Date | null } {
  if (reviews.length === 0) {
    return { confidence: 50, risk: 50, lastReviewAt: null };
  }

  let weightSum = 0;
  let scoreSum = 0;
  let lastReviewAt: Date | null = null;

  for (const r of reviews) {
    if (!lastReviewAt || r.createdAt > lastReviewAt) lastReviewAt = r.createdAt;

    const ageDays = Math.max(0, (now - r.createdAt.getTime()) / 86_400_000);
    const decay = Math.exp((-Math.LN2 * ageDays) / HALF_LIFE_DAYS);

    let score = clamp(r.safetyRating, 1, 5) * 20; // 20–100
    // Structured observations nudge the visit score
    const positives = [
      r.observedDedicatedKitchen,
      r.observedDedicatedFryer,
      r.observedSeparatePrep,
      r.observedLabeledMenu,
      r.observedStaffUnderstood,
    ].filter((v) => v === true).length;
    const negatives = [
      r.observedDedicatedKitchen,
      r.observedDedicatedFryer,
      r.observedSeparatePrep,
      r.observedLabeledMenu,
      r.observedStaffUnderstood,
    ].filter((v) => v === false).length;
    score += positives * 2 - negatives * 3;

    if (r.crossContactIncident) score -= 28;

    score = clamp(score, 0, 100);
    weightSum += decay;
    scoreSum += score * decay;
  }

  const confidence = Math.round(scoreSum / Math.max(weightSum, 0.0001));
  return {
    confidence: clamp(confidence, 0, 100),
    risk: clamp(100 - confidence, 0, 100),
    lastReviewAt,
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

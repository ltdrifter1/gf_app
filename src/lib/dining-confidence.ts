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

const CHECKLIST: { key: keyof ConfidenceReview; label: string }[] = [
  { key: "observedDedicatedKitchen", label: "Dedicated kitchen" },
  { key: "observedDedicatedFryer", label: "Dedicated fryer" },
  { key: "observedSeparatePrep", label: "Separate prep" },
  { key: "observedLabeledMenu", label: "Labeled menu" },
  { key: "observedStaffUnderstood", label: "Staff understood" },
];

export type TrustBadge = {
  key: string;
  label: string;
  tone: "good" | "warn" | "bad" | "neutral";
};

export type TrustRollup = {
  confidence: number;
  risk: number;
  lastReviewAt: Date | null;
  reviewCount: number;
  verifiedVisits: number;
  incidentCount: number;
  checklist: { key: string; label: string; yes: number; no: number }[];
  badges: TrustBadge[];
};

function isVerifiedVisit(r: ConfidenceReview) {
  const filled = CHECKLIST.filter((c) => typeof r[c.key] === "boolean").length;
  return filled >= 2;
}

export function computeTrustRollup(reviews: ConfidenceReview[], now = Date.now()): TrustRollup {
  const base = computeRestaurantConfidence(reviews, now);
  const verifiedVisits = reviews.filter(isVerifiedVisit).length;
  const incidentCount = reviews.filter((r) => r.crossContactIncident).length;
  const checklist = CHECKLIST.map((c) => ({
    key: String(c.key),
    label: c.label,
    yes: reviews.filter((r) => r[c.key] === true).length,
    no: reviews.filter((r) => r[c.key] === false).length,
  }));

  const badges: TrustBadge[] = [];
  if (verifiedVisits > 0) {
    badges.push({
      key: "verified",
      label: `${verifiedVisits} verified visit${verifiedVisits === 1 ? "" : "s"}`,
      tone: "good",
    });
  }
  const kitchen = checklist.find((c) => c.key === "observedDedicatedKitchen");
  if (kitchen && kitchen.yes >= 2 && kitchen.yes > kitchen.no) {
    badges.push({ key: "dedicated-kitchen", label: "Dedicated kitchen observed", tone: "good" });
  }
  const staff = checklist.find((c) => c.key === "observedStaffUnderstood");
  if (staff && staff.yes >= 2 && staff.yes > staff.no) {
    badges.push({ key: "staff", label: "Staff understood GF", tone: "good" });
  }
  if (incidentCount > 0) {
    badges.push({
      key: "incident",
      label:
        incidentCount === 1 ? "Cross-contact report" : `${incidentCount} cross-contact reports`,
      tone: "bad",
    });
  }
  if (base.lastReviewAt) {
    const ageDays = (now - base.lastReviewAt.getTime()) / 86_400_000;
    if (ageDays <= 90) {
      badges.push({ key: "fresh", label: "Fresh reviews", tone: "good" });
    } else {
      badges.push({ key: "stale", label: "Reviews going stale", tone: "warn" });
    }
  } else {
    badges.push({ key: "unverified", label: "No visits logged yet", tone: "neutral" });
  }

  return {
    ...base,
    reviewCount: reviews.length,
    verifiedVisits,
    incidentCount,
    checklist,
    badges,
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

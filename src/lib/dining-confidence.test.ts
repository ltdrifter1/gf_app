import { describe, expect, it } from "vitest";
import {
  applyClaimCap,
  CLAIM_CONFIDENCE_CAP,
  computeRestaurantConfidence,
  computeTrustRollup,
  hasRecentCrossContactIncident,
  listingStatusAfterReviews,
} from "@/lib/dining-confidence";

const now = new Date("2026-09-15T12:00:00Z").getTime();

describe("dining confidence", () => {
  it("caps claim-only listings", () => {
    expect(applyClaimCap(88, 0)).toBe(CLAIM_CONFIDENCE_CAP);
    expect(applyClaimCap(88, 1)).toBe(88);
    expect(computeRestaurantConfidence([], now).confidence).toBe(CLAIM_CONFIDENCE_CAP);
  });

  it("penalizes cross-contact incidents", () => {
    const withIncident = computeRestaurantConfidence(
      [
        {
          safetyRating: 5,
          crossContactIncident: true,
          createdAt: new Date(now - 2 * 86_400_000),
        },
      ],
      now
    );
    const clean = computeRestaurantConfidence(
      [
        {
          safetyRating: 5,
          crossContactIncident: false,
          createdAt: new Date(now - 2 * 86_400_000),
        },
      ],
      now
    );
    expect(withIncident.confidence).toBeLessThan(clean.confidence);
  });

  it("marks recent incidents and demotes published listings", () => {
    const reviews = [
      {
        safetyRating: 2,
        crossContactIncident: true,
        createdAt: new Date(now - 10 * 86_400_000),
      },
    ];
    expect(hasRecentCrossContactIncident(reviews, now)).toBe(true);
    expect(listingStatusAfterReviews("published", reviews, now)).toBe("disputed");
    expect(listingStatusAfterReviews("hidden", reviews, now)).toBe("hidden");
    expect(computeTrustRollup(reviews, now).incidentCount).toBe(1);
  });
});

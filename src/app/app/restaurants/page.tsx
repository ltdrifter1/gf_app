import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { RestaurantDirectory, type RestaurantItem } from "@/components/restaurant-directory";
import { computeRestaurantConfidence } from "@/lib/dining-confidence";

export default async function RestaurantsPage() {
  const user = await requireUser();
  const restaurants = await prisma.restaurant.findMany({
    where: { status: "published" },
    include: {
      reviews: {
        select: {
          rating: true,
          safetyRating: true,
          crossContactIncident: true,
          createdAt: true,
          observedDedicatedKitchen: true,
          observedDedicatedFryer: true,
          observedSeparatePrep: true,
          observedLabeledMenu: true,
          observedStaffUnderstood: true,
        },
      },
    },
    orderBy: { communityConfidence: "desc" },
  });

  const data: RestaurantItem[] = restaurants.map((r) => {
    const live = r.reviews.length
      ? computeRestaurantConfidence(r.reviews)
      : { confidence: r.communityConfidence, risk: r.crossContaminationRisk, lastReviewAt: r.lastReviewAt };
    return {
      id: r.id,
      name: r.name,
      city: r.city,
      address: r.address,
      lat: r.lat,
      lng: r.lng,
      imageUrl: r.imageUrl,
      cuisine: r.cuisine,
      priceLevel: r.priceLevel,
      dedicatedKitchen: r.dedicatedKitchen,
      celiacSafe: r.celiacSafe,
      glutenFreeMenu: r.glutenFreeMenu,
      delivery: r.delivery,
      dedicatedFryer: r.dedicatedFryer,
      certified: r.certified,
      communityConfidence: live.confidence,
      crossContaminationRisk: live.risk,
      avgRating: r.reviews.length
        ? r.reviews.reduce((s, x) => s + x.rating, 0) / r.reviews.length
        : 0,
      reviewCount: r.reviews.length,
      lastReviewAt: live.lastReviewAt?.toISOString?.() ?? (r.lastReviewAt?.toISOString() ?? null),
    };
  });

  // Prefer city from profile location e.g. "Austin, TX"
  const defaultCity = user.location?.split(",")[0]?.trim() || null;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">
          Safe Dining
        </h1>
        <p className="text-sage-500 dark:text-sage-400">
          Celiac-safe restaurants scored by structured community reviews — with decay so trust stays
          fresh.
        </p>
      </div>
      <RestaurantDirectory restaurants={data} defaultCity={defaultCity} />
    </div>
  );
}

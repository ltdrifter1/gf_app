import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { RestaurantDirectory, type RestaurantItem } from "@/components/restaurant-directory";

export default async function RestaurantsPage() {
  await requireUser();
  const restaurants = await prisma.restaurant.findMany({
    include: { reviews: { select: { rating: true } } },
    orderBy: { communityConfidence: "desc" },
  });

  const data: RestaurantItem[] = restaurants.map((r) => ({
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
    communityConfidence: r.communityConfidence,
    crossContaminationRisk: r.crossContaminationRisk,
    avgRating: r.reviews.length ? r.reviews.reduce((s, x) => s + x.rating, 0) / r.reviews.length : 0,
    reviewCount: r.reviews.length,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">Safe Dining</h1>
        <p className="text-sage-500 dark:text-sage-400">
          Celiac-safe restaurants, scored by the community — explore on the map.
        </p>
      </div>
      <RestaurantDirectory restaurants={data} />
    </div>
  );
}

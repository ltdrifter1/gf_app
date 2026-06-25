import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Flame, ChefHat, Truck, GraduationCap, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { RestaurantMap } from "@/components/restaurant-map";
import { RestaurantReviewForm } from "@/components/restaurant-review-form";
import { Stars } from "@/components/star-rating";
import { Avatar } from "@/components/ui/avatar";
import { safetyColor, safetyLabel, timeAgo, cn } from "@/lib/utils";

export default async function RestaurantDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();
  const r = await prisma.restaurant.findUnique({
    where: { id },
    include: { reviews: { include: { user: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!r) notFound();

  const avg = r.reviews.length ? r.reviews.reduce((s, x) => s + x.rating, 0) / r.reviews.length : 0;

  const features = [
    { on: r.dedicatedKitchen, label: "Dedicated kitchen", icon: ChefHat },
    { on: r.dedicatedFryer, label: "Dedicated fryer", icon: Flame },
    { on: r.separatePrepArea, label: "Separate prep area", icon: ShieldCheck },
    { on: r.certified, label: "GF certified", icon: ShieldCheck },
    { on: r.delivery, label: "Delivery", icon: Truck },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Link href="/app/restaurants" className="btn-ghost w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to map
      </Link>

      <div className="card overflow-hidden">
        {r.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.imageUrl} alt={r.name} className="h-56 w-full object-cover sm:h-72" />
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold text-sage-900 dark:text-white">{r.name}</h1>
              <p className="mt-1 text-sage-500 dark:text-sage-400">
                {r.cuisine} · {r.address}, {r.city} · {"$".repeat(r.priceLevel)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Stars value={avg} size={18} />
                <span className="text-sm text-sage-500">{avg.toFixed(1)} ({r.reviews.length} reviews)</span>
              </div>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-sage-600 p-4 text-center text-white">
              <p className="font-display text-3xl font-bold">{r.communityConfidence}%</p>
              <p className="text-xs text-white/80">Community confidence</p>
            </div>
          </div>

          {r.description && <p className="mt-4 text-sage-700 dark:text-sage-200">{r.description}</p>}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/60 dark:bg-white/5 p-4">
              <p className="text-xs font-medium text-sage-500">Cross-contamination risk</p>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-sage-200/70 dark:bg-white/10">
                <div
                  className={cn(
                    "h-full rounded-full",
                    r.crossContaminationRisk < 25 ? "bg-emerald-500" : r.crossContaminationRisk < 60 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: `${r.crossContaminationRisk}%` }}
                />
              </div>
              <p className={cn("mt-1 text-xs font-semibold", safetyColor(100 - r.crossContaminationRisk))}>
                {r.crossContaminationRisk < 25 ? "Low risk" : r.crossContaminationRisk < 60 ? "Moderate risk" : "Higher risk"}
              </p>
            </div>
            <div className="rounded-2xl bg-white/60 dark:bg-white/5 p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-sage-500">
                <GraduationCap className="h-3.5 w-3.5" /> Staff training
              </p>
              <p className="mt-2 font-display text-lg font-semibold capitalize text-sage-900 dark:text-white">
                {r.staffTrainingLevel}
              </p>
              <p className={cn("text-xs font-semibold", safetyColor(r.communityConfidence))}>{safetyLabel(r.communityConfidence)}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <span
                  key={f.label}
                  className={cn(
                    "chip",
                    f.on
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : "bg-sage-100/70 text-sage-400 line-through dark:bg-white/5"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {f.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Leave a review</h2>
            <p className="mb-4 text-sm text-sage-500">Help others dine safely.</p>
            <RestaurantReviewForm restaurantId={r.id} />
          </div>

          <div className="space-y-3">
            {r.reviews.map((rev) => (
              <div key={rev.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={rev.user.name} src={rev.user.avatarUrl} size={36} />
                  <div>
                    <p className="text-sm font-semibold text-sage-900 dark:text-white">{rev.user.name}</p>
                    <p className="text-xs text-sage-400">{timeAgo(rev.createdAt)}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Stars value={rev.rating} />
                    <span className="chip bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
                      Safety {rev.safetyRating}/5
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sage-700 dark:text-sage-200">{rev.content}</p>
              </div>
            ))}
            {r.reviews.length === 0 && (
              <div className="card p-6 text-center text-sage-500">No reviews yet — be the first!</div>
            )}
          </div>
        </div>

        <div className="card sticky top-24 h-80 overflow-hidden p-1.5 lg:h-[420px]">
          <RestaurantMap
            pins={[{ id: r.id, name: r.name, lat: r.lat, lng: r.lng, score: r.communityConfidence, city: r.city, imageUrl: r.imageUrl, celiacSafe: r.celiacSafe }]}
          />
        </div>
      </div>
    </div>
  );
}

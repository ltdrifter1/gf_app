"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Star, ShieldCheck, MapPin, Flame, ChefHat } from "lucide-react";
import { RestaurantMap, type MapPin as Pin } from "./restaurant-map";
import { safetyColor, safetyLabel, cn } from "@/lib/utils";

export type RestaurantItem = {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl: string | null;
  cuisine: string | null;
  priceLevel: number;
  dedicatedKitchen: boolean;
  celiacSafe: boolean;
  glutenFreeMenu: boolean;
  delivery: boolean;
  dedicatedFryer: boolean;
  certified: boolean;
  communityConfidence: number;
  crossContaminationRisk: number;
  avgRating: number;
  reviewCount: number;
};

const FILTERS = [
  { key: "dedicatedKitchen", label: "Dedicated kitchen", icon: ChefHat },
  { key: "celiacSafe", label: "Celiac safe", icon: ShieldCheck },
  { key: "glutenFreeMenu", label: "GF menu", icon: Star },
  { key: "delivery", label: "Delivery", icon: MapPin },
  { key: "dedicatedFryer", label: "Dedicated fryer", icon: Flame },
] as const;

export function RestaurantDirectory({ restaurants }: { restaurants: RestaurantItem[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (query) {
        const q = query.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.city.toLowerCase().includes(q) && !(r.cuisine || "").toLowerCase().includes(q))
          return false;
      }
      for (const f of FILTERS) {
        if (active[f.key] && !r[f.key as keyof RestaurantItem]) return false;
      }
      return true;
    });
  }, [restaurants, query, active]);

  const pins: Pin[] = filtered.map((r) => ({
    id: r.id,
    name: r.name,
    lat: r.lat,
    lng: r.lng,
    score: r.communityConfidence,
    city: r.city,
    imageUrl: r.imageUrl,
    celiacSafe: r.celiacSafe,
  }));

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, or cuisine…"
            className="input pl-11"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const on = active[f.key];
            return (
              <button
                key={f.key}
                onClick={() => setActive((a) => ({ ...a, [f.key]: !a[f.key] }))}
                className={cn(
                  "chip border transition",
                  on
                    ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                    : "border-sage-200/70 bg-white/60 text-sage-600 dark:border-white/10 dark:bg-white/5 dark:text-sage-300"
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* List */}
        <div className="space-y-3">
          <p className="text-sm text-sage-500 dark:text-sage-400">
            {filtered.length} celiac-friendly {filtered.length === 1 ? "place" : "places"}
          </p>
          {filtered.map((r) => (
            <Link
              key={r.id}
              href={`/app/restaurants/${r.id}`}
              onMouseEnter={() => setSelected(r.id)}
              className="card group flex gap-4 overflow-hidden p-3 transition hover:shadow-glass-lg"
            >
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-sage-100">
                {r.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.imageUrl} alt={r.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display font-semibold text-sage-900 dark:text-white">{r.name}</p>
                    <p className="text-xs text-sage-500 dark:text-sage-400">
                      {r.cuisine} · {r.city} · {"$".repeat(r.priceLevel)}
                    </p>
                  </div>
                  {r.certified && (
                    <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      <ShieldCheck className="h-3 w-3" /> Certified
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400" /> {r.avgRating.toFixed(1)} ({r.reviewCount})
                  </span>
                  <span className={cn("font-semibold", safetyColor(r.communityConfidence))}>
                    {r.communityConfidence}% {safetyLabel(r.communityConfidence)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.dedicatedKitchen && <span className="chip bg-sage-100 text-sage-700 dark:bg-white/10 dark:text-sage-200">Dedicated kitchen</span>}
                  {r.dedicatedFryer && <span className="chip bg-sage-100 text-sage-700 dark:bg-white/10 dark:text-sage-200">GF fryer</span>}
                  {r.delivery && <span className="chip bg-sage-100 text-sage-700 dark:bg-white/10 dark:text-sage-200">Delivery</span>}
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="card p-8 text-center text-sage-500">No restaurants match those filters.</div>
          )}
        </div>

        {/* Map */}
        <div className="card sticky top-24 h-[calc(100vh-8rem)] overflow-hidden p-1.5">
          <RestaurantMap pins={pins} activeId={selected} onSelect={setSelected} />
        </div>
      </div>
    </div>
  );
}

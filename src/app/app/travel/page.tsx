import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { safetyColor } from "@/lib/utils";
import { Plane, Download, Globe, Lock, MapPin, AlertCircle } from "lucide-react";

const PHRASES = [
  { lang: "Spanish", phrase: "Soy celíaco/a. No puedo comer gluten ni trigo." },
  { lang: "French", phrase: "Je suis cœliaque. Je ne peux pas manger de gluten." },
  { lang: "Italian", phrase: "Sono celiaco/a. Non posso mangiare glutine." },
  { lang: "German", phrase: "Ich habe Zöliakie. Ich kann kein Gluten essen." },
  { lang: "Japanese", phrase: "グルテンアレルギーです。小麦は食べられません。" },
];

export default async function TravelPage() {
  const user = await requireUser();
  const restaurants = await prisma.restaurant.findMany({ orderBy: { communityConfidence: "desc" } });
  const cities = Array.from(new Set(restaurants.map((r) => r.city)));

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-sky-400 to-brand-500 p-8">
          <Plane className="h-8 w-8 text-white" />
          <h1 className="mt-3 font-display text-3xl font-bold text-white">Travel Mode</h1>
          <p className="mt-1 max-w-xl text-white/90">Eat safely anywhere. City guides, phrase cards, and emergency dining tips.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-sage-900 dark:text-white">
            <Globe className="h-5 w-5 text-brand-600" /> Safe dining by city
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {cities.map((city) => {
              const cityRestaurants = restaurants.filter((r) => r.city === city);
              const top = cityRestaurants.slice(0, 3);
              return (
                <div key={city} className="card p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-1.5 font-display font-semibold text-sage-900 dark:text-white">
                      <MapPin className="h-4 w-4 text-brand-500" /> {city}
                    </h3>
                    <span className="text-xs text-sage-400">{cityRestaurants.length} spots</span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {top.map((r) => (
                      <li key={r.id}>
                        <Link href={`/app/restaurants/${r.id}`} className="flex items-center justify-between rounded-xl bg-white/60 dark:bg-white/5 px-3 py-2 text-sm hover:bg-white/90 dark:hover:bg-white/10">
                          <span className="text-sage-700 dark:text-sage-200">{r.name}</span>
                          <span className={`font-semibold ${safetyColor(r.communityConfidence)}`}>{r.communityConfidence}%</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button className="btn-secondary mt-3 w-full text-sm">
                    {user.isPremium ? <><Download className="h-4 w-4" /> Download city guide</> : <><Lock className="h-4 w-4" /> Premium guide</>}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="card p-5">
            <h3 className="flex items-center gap-2 font-display font-semibold text-sage-900 dark:text-white">
              <AlertCircle className="h-5 w-5 text-rose-500" /> Emergency dining guide
            </h3>
            <ul className="mt-3 grid gap-2 text-sm text-sage-600 dark:text-sage-300 sm:grid-cols-2">
              <li className="rounded-xl bg-white/60 dark:bg-white/5 p-3">🛒 Grocery stores: fresh fruit, yogurt, nuts, and certified GF snacks are safe bets.</li>
              <li className="rounded-xl bg-white/60 dark:bg-white/5 p-3">🍳 Naturally GF cuisines: Mexican (corn), Thai (rice), Indian (many dishes), poke.</li>
              <li className="rounded-xl bg-white/60 dark:bg-white/5 p-3">✈️ Airports: pack shelf-stable snacks; most lounges have fruit & cheese.</li>
              <li className="rounded-xl bg-white/60 dark:bg-white/5 p-3">🏨 Hotels: request a mini-fridge and microwave for safe meal prep.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-display font-semibold text-sage-900 dark:text-white">Gluten-free phrase cards</h3>
            <p className="mb-3 text-sm text-sage-500">Show these when dining abroad.</p>
            <div className="space-y-2">
              {PHRASES.map((p) => (
                <div key={p.lang} className="rounded-2xl bg-gradient-to-br from-brand-50 to-sage-50 dark:from-brand-500/10 dark:to-sage-500/10 p-3">
                  <p className="text-xs font-semibold text-brand-700 dark:text-brand-200">{p.lang}</p>
                  <p className="text-sm text-sage-700 dark:text-sage-200">{p.phrase}</p>
                </div>
              ))}
            </div>
          </div>

          {!user.isPremium && (
            <Link href="/app/premium" className="card block bg-gradient-to-br from-warm-400 to-warm-500 p-5 text-white hover:shadow-glass-lg transition">
              <h3 className="font-display font-semibold">Unlock all travel guides</h3>
              <p className="mt-1 text-sm text-white/90">Downloadable city guides & more with Premium.</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

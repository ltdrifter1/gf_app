import { requireUser } from "@/lib/auth";
import { PremiumButton } from "@/components/premium-button";
import { PREMIUM_PRICE_USD, PREMIUM_AI_CREDITS } from "@/lib/constants";
import { Crown, Check, Filter, MapPinned, Sparkles, Video, Users } from "lucide-react";

const BENEFITS = [
  { icon: Filter, title: "Advanced restaurant filtering", desc: "Filter by certification, dedicated kitchen, training level & more." },
  { icon: MapPinned, title: "Downloadable travel guides", desc: "Offline city guides for safe dining anywhere." },
  { icon: Sparkles, title: `${PREMIUM_AI_CREDITS} AI assistant credits`, desc: "Generous monthly credits for the Celiac Assistant." },
  { icon: Video, title: "Verified expert webinars", desc: "Live and recorded sessions with doctors & dietitians." },
  { icon: Users, title: "Private support groups", desc: "Smaller, moderated circles for deeper connection." },
];

export default async function PremiumPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="card overflow-hidden">
        <div className="relative bg-gradient-to-br from-warm-400 via-warm-500 to-brand-500 p-8 text-white">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <Crown className="h-9 w-9" />
          <h1 className="mt-3 font-display text-3xl font-bold">Circle Premium</h1>
          <p className="mt-1 max-w-lg text-white/90">Go deeper into safe dining, travel, and expert support — for the price of one safe lunch.</p>
          <p className="mt-4 font-display text-4xl font-bold">${PREMIUM_PRICE_USD}<span className="text-lg font-normal text-white/80">/month</span></p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="card p-5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-warm-400 to-brand-500 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-display font-semibold text-sage-900 dark:text-white">{b.title}</h3>
                <p className="mt-1 text-sm text-sage-500 dark:text-sage-400">{b.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="card h-fit p-6">
          <h3 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Everything in Free, plus:</h3>
          <ul className="mt-3 space-y-2">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex items-start gap-2 text-sm text-sage-700 dark:text-sage-200">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {b.title}
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <PremiumButton isPremium={user.isPremium} />
          </div>
          <p className="mt-3 text-center text-xs text-sage-400">Cancel anytime. No hidden fees.</p>
        </div>
      </div>
    </div>
  );
}

import { requireUser } from "@/lib/auth";
import { PremiumButton } from "@/components/premium-button";
import { PREMIUM_PRICE_USD } from "@/lib/constants";
import { Crown, Check, BadgeCheck, Heart, Sparkles, Shield } from "lucide-react";

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: "Premium badge",
    desc: "A subtle crown on your profile — show you support the Circle.",
  },
  {
    icon: Sparkles,
    title: "Early access",
    desc: "Be first to try new rooms and features as they ship.",
  },
  {
    icon: Shield,
    title: "Ad-free forever",
    desc: "Help keep Circle calm, focused, and free of noise.",
  },
  {
    icon: Heart,
    title: "Support the network",
    desc: "Fund hosting and community moderation so everyone can stay.",
  },
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
          <p className="mt-1 max-w-lg text-white/90">
            Optional support membership — same community for everyone, a badge for those who fund it.
          </p>
          <p className="mt-4 font-display text-4xl font-bold">
            ${PREMIUM_PRICE_USD}
            <span className="text-lg font-normal text-white/80">/month</span>
          </p>
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
                <h3 className="mt-3 font-display font-semibold text-sage-900 dark:text-white">
                  {b.title}
                </h3>
                <p className="mt-1 text-sm text-sage-500 dark:text-sage-400">{b.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="card h-fit p-6">
          <h3 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
            Support Circle
          </h3>
          <ul className="mt-3 space-y-2">
            {BENEFITS.map((b) => (
              <li
                key={b.title}
                className="flex items-start gap-2 text-sm text-sage-700 dark:text-sage-200"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {b.title}
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <PremiumButton isPremium={user.isPremium} />
          </div>
          <p className="mt-3 text-center text-xs text-sage-400">
            Cancel anytime. Core features stay free for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}

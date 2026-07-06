import Link from "next/link";
import {
  Users,
  MapPin,
  GraduationCap,
  HeartPulse,
  ChefHat,
  Sparkles,
  ArrowRight,
  Check,
  MessageCircle,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth";

const FEATURES = [
  {
    icon: Users,
    title: "Community",
    desc: "Share your story, ask questions, and connect with people who truly understand celiac life.",
    color: "from-brand-400 to-brand-600",
  },
  {
    icon: MapPin,
    title: "Safe Dining",
    desc: "An Airbnb-style map of celiac-safe restaurants with cross-contamination scores and real reviews.",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: GraduationCap,
    title: "Expert Guidance",
    desc: "Verified doctors and dietitians publish trusted articles, videos, and answer your questions.",
    color: "from-teal-400 to-sage-600",
  },
  {
    icon: HeartPulse,
    title: "Mental Health Support",
    desc: "Mood tracking, guided journaling, and a gentle space for the emotional side of diagnosis.",
    color: "from-rose-400 to-pink-500",
  },
  {
    icon: ChefHat,
    title: "Recipes",
    desc: "Hundreds of trusted gluten-free recipes with nutrition facts, ratings, and collections.",
    color: "from-orange-400 to-warm-500",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    desc: "Ask 'Is this safe?' anytime. Get sourced, educational answers — never a substitute for your doctor.",
    color: "from-violet-400 to-brand-500",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  const primaryHref = user ? "/app" : "/register";

  return (
    <div className="relative overflow-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-30 px-4 pt-4">
        <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-sage-600 dark:text-sage-300 md:flex">
            <a href="#features" className="hover:text-brand-600">Features</a>
            <a href="#dining" className="hover:text-brand-600">Safe Dining</a>
            <a href="#community" className="hover:text-brand-600">Community</a>
            <a href="#pricing" className="hover:text-brand-600">Premium</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link href="/app" className="btn-primary">Open app</Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost hidden sm:inline-flex">Sign in</Link>
                <Link href="/register" className="btn-primary">Join free</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:pt-24">
        <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-300/20 blur-3xl" />
        <div className="mx-auto max-w-3xl text-center">
          <span className="chip mx-auto glass !py-1.5 text-sage-600 dark:text-sage-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.6)] animate-pulse-soft" />
            12,000+ members online across 40+ countries
          </span>
          <h1 className="mt-6 font-display text-6xl font-bold leading-[1.02] tracking-tight text-sage-900 dark:text-white sm:text-7xl md:text-8xl">
            Find your <span className="text-gradient">Circle.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-sage-600 dark:text-sage-300">
            A community-first home for people living gluten-free. Safe restaurants,
            trusted recipes, expert guidance, and real human support — for celiac
            disease and gluten intolerance, anywhere in the world.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={primaryHref} className="btn-primary px-7 py-3.5 text-base">
              {user ? "Go to your feed" : "Find your Circle — it's free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#dining" className="btn-secondary px-7 py-3.5 text-base">
              Explore safe dining
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-sage-500 dark:text-sage-400">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> Free to join</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> Works globally</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> No ads · Privacy-first</span>
          </div>
        </div>

        {/* Floating preview cards */}
        <div className="relative mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-3">
          <PreviewCard
            icon={MessageCircle}
            title="General Support"
            sub="284 online now"
            accent="from-brand-400 to-brand-600"
          />
          <PreviewCard
            icon={MapPin}
            title="Mariposa Kitchen"
            sub="92% Celiac Safe · dedicated fryer"
            accent="from-amber-400 to-orange-500"
            className="sm:-translate-y-6"
          />
          <PreviewCard
            icon={ChefHat}
            title="5-Min Banana Oat Pancakes"
            sub="★ 4.9 · 312 made it"
            accent="from-orange-400 to-warm-500"
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-sage-900 dark:text-white sm:text-4xl">
            Everything your Circle needs, in one place
          </h2>
          <p className="mt-4 text-sage-600 dark:text-sage-300">
            Built with the warmth of a community and the polish of your favorite apps.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} id={f.title === "Safe Dining" ? "dining" : f.title === "Community" ? "community" : undefined} className="card group p-6 transition hover:-translate-y-1 hover:shadow-glass-lg">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-soft`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-sage-900 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sage-600 dark:text-sage-300">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-5xl px-4 py-20">
        <div className="card grid items-center gap-8 overflow-hidden p-8 sm:p-12 md:grid-cols-2">
          <div>
            <span className="chip bg-warm-400/20 text-warm-500">Premium</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-sage-900 dark:text-white">
              Go deeper for $9/mo
            </h2>
            <p className="mt-3 text-sage-600 dark:text-sage-300">
              Everything free, plus advanced restaurant filtering, downloadable
              travel guides, generous AI assistant credits, expert webinars, and
              private support groups.
            </p>
            <Link href={primaryHref} className="btn-primary mt-6 px-6 py-3">
              Start free, upgrade anytime
            </Link>
          </div>
          <ul className="space-y-3">
            {[
              "Advanced restaurant safety filtering",
              "Downloadable city travel guides",
              "200 AI assistant credits / month",
              "Verified expert webinars",
              "Private support groups",
            ].map((p) => (
              <li key={p} className="flex items-center gap-3 rounded-2xl bg-white/50 dark:bg-white/5 px-4 py-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sage-700 dark:text-sage-200">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="relative overflow-hidden rounded-4xl bg-circle-gradient p-10 text-center shadow-glow sm:p-16">
          <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            You don't have to figure this out alone.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Join Circle today and find your people.
          </p>
          <Link href={primaryHref} className="btn mt-8 bg-white px-8 py-3.5 text-base font-semibold text-brand-700 hover:bg-white/90" style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.7)" }}>
            {user ? "Open the app" : "Create your free account"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/40 dark:border-white/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-sage-500 dark:text-sage-400 sm:flex-row">
          <Logo size={28} />
          <p>© {new Date().getFullYear()} Circle. Find your Circle. 🔵</p>
        </div>
      </footer>
    </div>
  );
}

function PreviewCard({
  icon: Icon,
  title,
  sub,
  accent,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  sub: string;
  accent: string;
  className?: string;
}) {
  return (
    <div className={`card flex items-center gap-3 p-4 ${className}`}>
      <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-white`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-sage-900 dark:text-white">{title}</p>
        <p className="truncate text-sm text-sage-500 dark:text-sage-400">{sub}</p>
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  Users,
  MessageCircle,
  Crown,
  ArrowRight,
  Check,
  Circle,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth";
import { PREMIUM_PRICE_USD } from "@/lib/constants";

const FEATURES = [
  {
    icon: Users,
    title: "Community feed",
    desc: "Share wins, ask questions, and find people who actually get gluten-free life.",
  },
  {
    icon: MessageCircle,
    title: "MSN-style Messenger",
    desc: "Buddy-list rooms with live presence and typing — chat like it's 2003, support like it's now.",
  },
  {
    icon: Crown,
    title: "Premium Lounge",
    desc: "A quieter members-only circle, premium badge, and early access to new rooms.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  const primaryHref = user ? "/app" : "/register";

  return (
    <div className="relative overflow-hidden">
      <header className="sticky top-0 z-30 px-4 pt-4">
        <div className="glass mx-auto flex max-w-5xl items-center justify-between rounded-full px-5 py-3">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-sage-600 dark:text-sage-300 md:flex">
            <a href="#features" className="hover:text-brand-600">
              Features
            </a>
            <a href="#messenger" className="hover:text-brand-600">
              Messenger
            </a>
            <a href="#pricing" className="hover:text-brand-600">
              Premium
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link href="/app" className="btn-primary">
                Open app
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost hidden sm:inline-flex">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary">
                  Join free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-5xl px-4 pb-16 pt-16 sm:pt-24">
        <div className="absolute left-1/2 top-0 -z-10 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-brand-300/20 blur-3xl animate-pulse-soft" />
        <div className="mx-auto max-w-3xl text-center">
          <span className="chip mx-auto glass !py-1.5 text-sage-600 dark:text-sage-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.6)] animate-pulse-soft" />
            Presence on · rooms open
          </span>
          <h1 className="mt-6 font-display text-6xl font-bold leading-[1.02] tracking-tight text-sage-900 dark:text-white sm:text-7xl md:text-8xl">
            Find your <span className="text-gradient">Circle.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-sage-600 dark:text-sage-300">
            The premium gluten-free social network — community feed plus an
            MSN Messenger–style lounge for people living with celiac and gluten
            intolerance.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={primaryHref} className="btn-primary px-7 py-3.5 text-base">
              {user ? "Go to your feed" : "Find your Circle — it's free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#messenger" className="btn-secondary px-7 py-3.5 text-base">
              See Messenger
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-sage-500 dark:text-sage-400">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-500" /> Free to join
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-500" /> Live presence
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-500" /> No ads
            </span>
          </div>
        </div>

        <div
          id="messenger"
          className="relative mx-auto mt-16 max-w-2xl animate-fade-in"
        >
          <div className="card overflow-hidden shadow-glass-lg">
            <div className="flex items-center gap-3 border-b border-white/40 bg-gradient-to-r from-brand-500/15 to-accent-500/10 px-5 py-3 dark:border-white/10">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-circle-gradient text-lg text-white">
                💬
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="font-display font-semibold text-sage-900 dark:text-white">
                  General Support
                </p>
                <p className="flex items-center gap-1.5 text-xs text-sage-500">
                  <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                  3 online · typing…
                </p>
              </div>
            </div>
            <div className="space-y-3 px-5 py-5 text-left">
              <Bubble name="Maya" text="Found a dedicated GF kitchen today — crying happy tears" />
              <Bubble name="Priya" text="2 weeks post diagnosis. Overwhelmed but glad I'm here." />
              <Bubble name="You" text="You've got this. Ask us anything 💙" mine />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-5xl px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-sage-900 dark:text-white sm:text-4xl">
            Three things. Done well.
          </h2>
          <p className="mt-4 text-sage-600 dark:text-sage-300">
            No bloated platform — just community, chat, and a premium circle.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card p-6 transition hover:-translate-y-1 hover:shadow-glass-lg">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-circle-gradient text-white shadow-soft">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-sage-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sage-600 dark:text-sage-300">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-4xl px-4 py-16">
        <div className="card grid items-center gap-8 overflow-hidden p-8 sm:p-12 md:grid-cols-2">
          <div>
            <span className="chip bg-warm-400/20 text-warm-500">Premium</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-sage-900 dark:text-white">
              ${PREMIUM_PRICE_USD}/mo for the Lounge
            </h2>
            <p className="mt-3 text-sage-600 dark:text-sage-300">
              Free forever for the feed and community rooms. Premium unlocks the
              private Lounge, your badge, and early access to new spaces.
            </p>
            <Link href={primaryHref} className="btn-primary mt-6 px-6 py-3">
              Start free, upgrade anytime
            </Link>
          </div>
          <ul className="space-y-3">
            {[
              "Premium Lounge chat room",
              "Premium badge on your profile",
              "Early access to new rooms",
              "Support building Circle",
            ].map((p) => (
              <li
                key={p}
                className="flex items-center gap-3 rounded-2xl bg-white/50 px-4 py-3 dark:bg-white/5"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sage-700 dark:text-sage-200">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div className="relative overflow-hidden rounded-4xl bg-circle-gradient p-10 text-center shadow-glow sm:p-16">
          <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            You don&apos;t have to figure this out alone.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Join Circle today — open the feed, hop in Messenger, find your people.
          </p>
          <Link
            href={primaryHref}
            className="btn mt-8 bg-white px-8 py-3.5 text-base font-semibold text-brand-700 hover:bg-white/90"
            style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.7)" }}
          >
            {user ? "Open the app" : "Create your free account"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/40 py-10 dark:border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 text-sm text-sage-500 dark:text-sage-400 sm:flex-row">
          <Logo size={28} />
          <p>© {new Date().getFullYear()} Circle. Find your Circle.</p>
        </div>
      </footer>
    </div>
  );
}

function Bubble({
  name,
  text,
  mine,
}: {
  name: string;
  text: string;
  mine?: boolean;
}) {
  return (
    <div className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      {!mine && (
        <span className="mb-0.5 px-1 text-xs font-medium text-sage-500">{name}</span>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-soft ${
          mine
            ? "rounded-br-md bg-brand-600 text-white"
            : "rounded-bl-md bg-white/80 text-sage-800 dark:bg-white/10 dark:text-sage-100"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

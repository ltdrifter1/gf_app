import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeroMessenger } from "@/components/hero-messenger";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LandingPage() {
  const user = await getCurrentUser();
  const primaryHref = user ? "/app" : "/register";

  const since = new Date(Date.now() - 60_000);
  const hourAgo = new Date(Date.now() - 3600_000);
  const [onlineCount, recentMessages, hourMessages, topRestaurant] = await Promise.all([
    prisma.user.count({
      where: { presence: "online", lastSeen: { gte: since } },
    }),
    prisma.message.findMany({
      where: { room: { slug: "general-support" } },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { sender: { select: { name: true } } },
    }),
    prisma.message.count({
      where: { createdAt: { gte: hourAgo } },
    }),
    prisma.restaurant.findFirst({
      where: { celiacSafe: true },
      orderBy: { communityConfidence: "desc" },
    }),
  ]);

  const presenceLabel =
    onlineCount > 0
      ? `${onlineCount} ${onlineCount === 1 ? "person" : "people"} online now`
      : hourMessages > 0
        ? `${hourMessages} messages in the last hour`
        : "Rooms open — come say hi";

  const bubbles = recentMessages
    .reverse()
    .map((m) => ({
      name: m.sender.name.split(" ")[0],
      text: m.content,
    }));

  const messengerOnline = Math.max(onlineCount, hourMessages > 0 ? 1 : 0);

  return (
    <div className="relative overflow-hidden">
      <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo />
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

      <section className="relative min-h-[100svh] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="relative z-10 flex flex-col justify-center px-6 pb-10 pt-28 sm:px-10 lg:px-14 lg:pb-20 lg:pt-24">
          <p className="animate-fade-in text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
            Your Celiac Network
          </p>

          <h1 className="mt-4 font-display text-5xl font-bold leading-[1.02] tracking-tight text-sage-900 animate-fade-in dark:text-white sm:text-6xl lg:text-7xl [animation-delay:60ms]">
            <span className="text-gradient">YCN</span>
          </h1>

          <p className="mt-4 font-display text-2xl font-semibold tracking-tight text-sage-800 animate-fade-in dark:text-sage-100 sm:text-3xl [animation-delay:100ms]">
            Connect. Share. Belong.
          </p>

          <p className="mt-5 max-w-md text-lg text-sage-600 animate-fade-in dark:text-sage-300 [animation-delay:140ms]">
            The gluten-free social network with live MSN-style messenger — for
            people living with celiac and gluten intolerance.
          </p>

          <p className="mt-5 flex items-center gap-2 text-sm font-medium text-sage-600 animate-fade-in dark:text-sage-300 [animation-delay:180ms]">
            <span className="h-2 w-2 animate-pulse-soft rounded-full bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.55)]" />
            {presenceLabel}
          </p>

          <div className="mt-8 flex flex-wrap gap-3 animate-fade-in [animation-delay:220ms]">
            <Link href={primaryHref} className="btn-primary px-7 py-3.5 text-base">
              {user ? "Go to your feed" : "Join free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative min-h-[52vh] lg:min-h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-500 to-teal-500" />
          <div className="absolute -left-20 top-1/4 h-72 w-72 animate-float rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative flex h-full items-end px-4 pb-6 pt-4 sm:px-8 sm:pb-10 lg:items-center lg:px-10 lg:py-24">
            <HeroMessenger
              onlineCount={messengerOnline || onlineCount}
              messages={
                bubbles.length > 0
                  ? bubbles
                  : [
                      {
                        name: "Maya",
                        text: "Found a dedicated GF kitchen today — crying happy tears",
                      },
                      {
                        name: "Priya",
                        text: "Two weeks post diagnosis. Glad I'm not alone here.",
                      },
                      {
                        name: "Leo",
                        text: "You've got this. Ask us anything.",
                      },
                    ]
              }
            />
          </div>
        </div>
      </section>

      <section id="dining" className="mx-auto max-w-5xl px-6 py-20 sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Also in YCN
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-sage-900 dark:text-white sm:text-4xl">
          Find places that actually get it
        </h2>
        <p className="mt-3 max-w-xl text-sage-600 dark:text-sage-300">
          Community-scored restaurants with cross-contamination context — then
          talk it through in Messenger.
        </p>

        {topRestaurant && (
          <div className="mt-10 overflow-hidden rounded-4xl border border-white/50 bg-white/40 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="grid md:grid-cols-[1.2fr_1fr]">
              <div className="relative min-h-[220px] bg-sage-200 dark:bg-sage-800">
                {topRestaurant.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={topRestaurant.imageUrl}
                    alt={topRestaurant.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col justify-center p-8">
                <span className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                  {topRestaurant.communityConfidence}% community confidence
                </span>
                <h3 className="mt-3 font-display text-2xl font-bold text-sage-900 dark:text-white">
                  {topRestaurant.name}
                </h3>
                <p className="mt-2 flex items-center gap-1.5 text-sage-500">
                  <MapPin className="h-4 w-4" />
                  {topRestaurant.city}
                  {topRestaurant.cuisine ? ` · ${topRestaurant.cuisine}` : ""}
                </p>
                <p className="mt-3 text-sm text-sage-600 dark:text-sage-300">
                  {topRestaurant.description}
                </p>
                <Link href={primaryHref} className="btn-secondary mt-6 w-fit">
                  Explore safe dining
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="px-6 pb-24 sm:px-10">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-4xl bg-ycn-gradient px-8 py-14 text-center shadow-glow sm:px-16 sm:py-16">
          <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">
            Connect. Share. Belong.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-white/85">
            {presenceLabel} — join the conversation on YCN.
          </p>
          <Link
            href={primaryHref}
            className="btn relative mt-8 bg-white px-8 py-3.5 text-base font-semibold text-brand-700 hover:bg-white/90"
            style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.7)" }}
          >
            {user ? "Open the app" : "Create your free account"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/40 py-10 dark:border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 text-sm text-sage-500 dark:text-sage-400 sm:flex-row sm:px-10">
          <Logo size={28} />
          <p>© {new Date().getFullYear()} YCN · Your Celiac Network</p>
        </div>
      </footer>
    </div>
  );
}

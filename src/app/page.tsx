import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle, UtensilsCrossed, HeartPulse, BookOpen, Users } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeroMessenger } from "@/components/hero-messenger";
import { StoreShelf, StoreShelfCard } from "@/components/store-shelf";
import { getCurrentUser } from "@/lib/auth";
import { ensureLaunchCatalog } from "@/lib/bootstrap";
import { prisma } from "@/lib/prisma";
import { ROOM_EMOJI } from "@/lib/chat";

const DEMO_MESSAGES = [
  { name: "Maya", text: "Just found a dedicated GF kitchen nearby — finally relaxed." },
  { name: "Jordan", text: "Welcome. Ask anything. We've all been the new person." },
  { name: "You", text: "Thank you. That means a lot." },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  const primaryHref = user ? "/app/chat" : "/register";
  const primaryLabel = user ? "Open Messenger" : "Get started";

  await ensureLaunchCatalog();

  const rooms = await prisma.chatRoom.findMany({
    where: { isCommunity: true },
    orderBy: { createdAt: "asc" },
    take: 6,
    select: { name: true, slug: true, description: true },
  });

  const onlineSince = new Date(Date.now() - 60_000);
  const onlineCount = await prisma.user.count({
    where: { presence: "online", lastSeen: { gte: onlineSince } },
  });

  return (
    <div className="min-h-[100svh] bg-[#F2F4F3] text-sage-900 dark:bg-[#0a1210] dark:text-sage-100">
      {/* Frosted iOS-style nav */}
      <header className="sticky top-0 z-40 border-b border-black/[0.04] bg-[#F2F4F3]/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a1210]/80">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo showText={false} size={32} />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            {user ? (
              <Link href="/app/chat" className="btn-primary px-4 py-2 text-sm">
                Open Messenger
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn-ghost hidden px-3 py-2 text-sm text-sage-600 sm:inline-flex dark:text-sage-300"
                >
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary px-4 py-2 text-sm">
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero — brand + one headline + CTA + dominant visual plane */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(13,148,136,0.18),transparent_55%),radial-gradient(ellipse_at_90%_40%,rgba(14,165,233,0.12),transparent_45%),linear-gradient(180deg,#F2F4F3_0%,#E7F3F1_45%,#F2F4F3_100%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(13,148,136,0.22),transparent_55%),radial-gradient(ellipse_at_90%_40%,rgba(14,165,233,0.12),transparent_45%),linear-gradient(180deg,#0a1210_0%,#0d1a18_50%,#0a1210_100%)]" />
        <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 animate-float rounded-full bg-brand-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-accent-400/15 blur-3xl" />

        <div className="relative mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-5xl flex-col items-center justify-center px-6 pb-16 pt-10 text-center">
          <div className="animate-fade-in">
            <Image
              src="/logo.webp"
              alt="Safely"
              width={128}
              height={128}
              priority
              className="mx-auto rounded-[28%] shadow-[0_20px_60px_-18px_rgba(13,148,136,0.45)]"
            />
          </div>

          <h1 className="mt-7 font-display text-5xl font-bold tracking-tight text-sage-900 animate-fade-in dark:text-white sm:text-6xl lg:text-7xl [animation-delay:80ms]">
            Safely
          </h1>

          <p className="mt-3 max-w-md text-lg font-medium text-sage-600 animate-fade-in dark:text-sage-300 sm:text-xl [animation-delay:140ms]">
            Find your people.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 animate-fade-in [animation-delay:200ms]">
            <Link href={primaryHref} className="btn-primary px-8 py-3.5 text-base">
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {!user && (
              <Link href="/login" className="btn-secondary px-6 py-3.5 text-base">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* App Store–style body */}
      <main className="relative z-10 mx-auto max-w-5xl space-y-12 px-4 pb-20 pt-4 sm:px-6 sm:space-y-14">
        {/* Featured editorial */}
        <section className="animate-fade-in">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-500">
            Featured
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-sage-900 dark:text-white sm:text-3xl">
            Messenger lounge
          </h2>
          <p className="mt-1.5 max-w-xl text-sm text-sage-500 dark:text-sage-400 sm:text-base">
            An MSN-style room where celiac and gluten-free people show up for each other — live.
          </p>

          <div className="mt-5 grid overflow-hidden rounded-[1.75rem] bg-white shadow-[0_8px_40px_-16px_rgba(15,118,110,0.28)] ring-1 ring-black/[0.04] dark:bg-white/[0.05] dark:ring-white/10 lg:grid-cols-2">
            <Link
              href={user ? "/app/chat" : "/register"}
              className="group flex flex-col justify-between gap-6 bg-safely-gradient p-6 text-white transition hover:brightness-105 sm:p-8"
            >
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/80">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Live rooms
                </span>
                <p className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Talk to people who get it
                </p>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">
                  Jump into General Support, Newly Diagnosed, Mental Health, and more —{" "}
                  {onlineCount} online now.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                {user ? "Open Messenger" : "Join and say hi"}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
            <div className="flex items-center justify-center bg-[#EEF6F4] p-5 dark:bg-black/20 sm:p-8">
              <HeroMessenger
                className="mx-auto max-w-sm lg:ml-0"
                onlineCount={Math.max(onlineCount, 3)}
                messages={DEMO_MESSAGES}
              />
            </div>
          </div>
        </section>

        <StoreShelf title="Explore" subtitle="Everything you need for a safer gluten-free life">
          <StoreShelfCard
            href={user ? "/app/restaurants" : "/register"}
            emoji="🍽️"
            title="Safe Dining"
            description="Community-trusted kitchens near you"
          />
          <StoreShelfCard
            href={user ? "/app/health" : "/register"}
            emoji="💚"
            title="Health"
            description="Track, journal, and calm tools"
          />
          <StoreShelfCard
            href={user ? "/app/recipes" : "/register"}
            emoji="👩‍🍳"
            title="Recipes"
            description="Meals the community actually cooks"
          />
          <StoreShelfCard
            href={user ? "/app" : "/register"}
            emoji="🤝"
            title="Community"
            description="Share wins, questions, and tips"
          />
          <StoreShelfCard
            href={user ? "/app/chat" : "/register"}
            emoji="💬"
            title="Messenger"
            description="Live rooms and private chats"
          />
        </StoreShelf>

        <StoreShelf title="Community rooms" subtitle="Surf in — someone is usually around">
          {rooms.map((r) => (
            <Link
              key={r.slug}
              href={user ? `/app/chat/${r.slug}` : "/register"}
              className="flex w-[15rem] shrink-0 snap-start items-center gap-3 rounded-[1.35rem] bg-white p-3.5 shadow-[0_2px_12px_-4px_rgba(15,118,110,0.12)] ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(15,118,110,0.28)] dark:bg-white/[0.06] dark:ring-white/10"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[1.1rem] bg-safely-gradient text-xl text-white shadow-glow">
                {ROOM_EMOJI[r.slug] ?? "💬"}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-sage-900 dark:text-white">
                  {r.name}
                </span>
                <span className="mt-0.5 block truncate text-[12px] text-sage-500 dark:text-sage-400">
                  {r.description ?? "Join the conversation"}
                </span>
              </span>
            </Link>
          ))}
        </StoreShelf>

        {/* Bottom CTA */}
        <section className="overflow-hidden rounded-[1.75rem] bg-white px-6 py-10 text-center shadow-[0_8px_40px_-20px_rgba(15,118,110,0.25)] ring-1 ring-black/[0.04] dark:bg-white/[0.05] dark:ring-white/10 sm:px-10">
          <div className="mx-auto flex max-w-md flex-col items-center">
            <div className="flex -space-x-2">
              {[Users, MessageCircle, HeartPulse, UtensilsCrossed, BookOpen].map((Icon, i) => (
                <span
                  key={i}
                  className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-50 to-accent-300/40 text-brand-700 ring-2 ring-white dark:from-brand-500/25 dark:to-accent-500/15 dark:text-brand-200 dark:ring-[#0a1210]"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-sage-900 dark:text-white sm:text-3xl">
              Your gluten-free companion
            </h2>
            <p className="mt-2 text-sm text-sage-500 dark:text-sage-400">
              Free to join. Built for celiac and gluten-free life — for real.
            </p>
            <Link href={primaryHref} className="btn-primary mt-6 px-8 py-3.5 text-base">
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/[0.04] py-8 text-center text-xs text-sage-400 dark:border-white/10">
        © {new Date().getFullYear()} Safely
      </footer>
    </div>
  );
}

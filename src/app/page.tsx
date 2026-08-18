import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeroMessenger } from "@/components/hero-messenger";
import { getCurrentUser } from "@/lib/auth";
import { ensureLaunchCatalog } from "@/lib/bootstrap";
import { prisma } from "@/lib/prisma";

const FALLBACK_MESSAGES = [
  {
    name: "Maya",
    text: "Found a dedicated GF kitchen today — crying happy tears.",
  },
  {
    name: "Priya",
    text: "Two weeks post diagnosis. Glad I'm not alone here.",
  },
  {
    name: "Leo",
    text: "You've got this. Ask us anything.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  const primaryHref = user ? "/app/chat" : "/register";

  await ensureLaunchCatalog();

  const since = new Date(Date.now() - 60_000);
  const hourAgo = new Date(Date.now() - 3600_000);
  const [onlineCount, recentMessages, hourMessages] = await Promise.all([
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
  ]);

  const presenceLabel =
    onlineCount > 0
      ? `${onlineCount} ${onlineCount === 1 ? "person" : "people"} online now`
      : hourMessages > 0
        ? `${hourMessages} messages in the last hour`
        : "Rooms open — come say hi";

  const bubbles = recentMessages
    .reverse()
    .filter((m) => !m.content.startsWith("***"))
    .map((m) => ({
      name: m.sender.name.split(" ")[0],
      text: m.content.slice(0, 140),
    }));

  const messengerOnline = Math.max(onlineCount, hourMessages > 0 ? 1 : 3);

  return (
    <div className="relative min-h-[100svh] overflow-hidden">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-[#eef5f3] dark:bg-[#071210]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,rgba(13,148,136,0.22),transparent_52%),radial-gradient(ellipse_at_88%_18%,rgba(2,132,200,0.16),transparent_48%),radial-gradient(ellipse_at_70%_90%,rgba(56,189,248,0.12),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_18%_12%,rgba(13,148,136,0.18),transparent_52%),radial-gradient(ellipse_at_88%_18%,rgba(2,132,200,0.12),transparent_48%)]" />
      <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 animate-float rounded-full bg-brand-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent-500/12 blur-3xl" />

      <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo size={40} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link href="/app/chat" className="btn-primary">
                Open Messenger
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn-ghost hidden text-sage-700 hover:bg-white/50 sm:inline-flex dark:text-white/80 dark:hover:bg-white/10"
                >
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary">
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Full-bleed hero: brand + MSN messenger plane */}
      <main className="relative z-10 mx-auto grid min-h-[100svh] max-w-6xl lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <div className="flex flex-col justify-center px-6 pb-8 pt-28 sm:px-10 lg:px-12 lg:pb-20 lg:pt-24">
          <p className="flex items-center gap-2 text-sm font-medium text-sage-600 animate-fade-in dark:text-sage-300">
            <span className="h-2 w-2 animate-pulse-soft rounded-full bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.55)]" />
            {presenceLabel}
          </p>

          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] tracking-[-0.03em] text-sage-900 animate-fade-in dark:text-white sm:text-6xl lg:text-7xl [animation-delay:80ms]">
            Safely
          </h1>

          <p className="mt-4 max-w-md text-lg leading-relaxed text-sage-600 animate-fade-in dark:text-sage-300 sm:text-xl [animation-delay:140ms]">
            Find your people — live MSN-style messenger for the gluten-free
            community.
          </p>

          <div className="mt-9 animate-fade-in [animation-delay:200ms]">
            <Link href={primaryHref} className="btn-primary px-8 py-3.5 text-base">
              {user ? "Open Messenger" : "Join free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative flex items-end px-4 pb-16 pt-2 sm:px-8 sm:pb-20 lg:items-center lg:px-6 lg:pb-12 lg:pt-24">
          <div className="pointer-events-none absolute inset-y-16 right-0 left-8 hidden rounded-[2rem] bg-safely-gradient opacity-90 blur-[1px] lg:block" />
          <div className="pointer-events-none absolute inset-y-10 -right-6 left-16 hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 via-brand-500 to-accent-400 opacity-80 lg:block" />
          <div className="pointer-events-none absolute -left-10 top-1/3 hidden h-64 w-64 rounded-full bg-white/20 blur-3xl lg:block" />

          <div className="relative w-full">
            <HeroMessenger
              onlineCount={messengerOnline}
              messages={bubbles.length > 0 ? bubbles : FALLBACK_MESSAGES}
            />
          </div>
        </div>
      </main>

      <footer className="absolute inset-x-0 bottom-0 z-10 py-5 text-center text-xs text-sage-500/80 dark:text-white/35">
        © {new Date().getFullYear()} Safely
      </footer>
    </div>
  );
}

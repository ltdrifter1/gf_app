import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
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
      <div className="pointer-events-none absolute inset-0 bg-[#eef5f3] dark:bg-[#071210]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,rgba(13,148,136,0.22),transparent_52%),radial-gradient(ellipse_at_88%_18%,rgba(2,132,200,0.16),transparent_48%),radial-gradient(ellipse_at_70%_90%,rgba(56,189,248,0.12),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_18%_12%,rgba(13,148,136,0.18),transparent_52%),radial-gradient(ellipse_at_88%_18%,rgba(2,132,200,0.12),transparent_48%)]" />
      <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 animate-float rounded-full bg-brand-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent-500/12 blur-3xl" />

      <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-2">
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
      </header>

      <main className="relative z-10 mx-auto grid min-h-[100svh] max-w-6xl overflow-x-clip xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.2fr)]">
        <div className="flex min-w-0 flex-col justify-center px-6 pb-6 pt-28 sm:px-10 xl:px-12 xl:pb-20 xl:pt-24">
          <p className="flex items-center gap-2 text-sm font-medium text-sage-600 animate-fade-in dark:text-sage-300">
            <span className="h-2 w-2 animate-pulse-soft rounded-full bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.55)]" />
            {presenceLabel}
          </p>

          <h1 className="mt-7 animate-fade-in [animation-delay:80ms]">
            <span className="sr-only">Safely</span>
            <Image
              src="/logo.webp"
              alt="Safely Celiac Community"
              width={168}
              height={168}
              priority
              className="rounded-[28%] shadow-[0_24px_80px_-20px_rgba(13,148,136,0.55)]"
            />
          </h1>

          <p className="mt-6 max-w-sm text-lg leading-relaxed text-sage-600 animate-fade-in dark:text-sage-300 sm:text-xl [animation-delay:140ms]">
            Find your people.
          </p>

          <div className="mt-9 animate-fade-in [animation-delay:200ms]">
            <Link href={primaryHref} className="btn-primary px-8 py-3.5 text-base">
              {user ? "Open Messenger" : "Join free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative flex min-w-0 items-start justify-center px-4 pb-20 pt-4 sm:px-8 sm:pb-24 xl:items-center xl:justify-end xl:px-6 xl:pb-12 xl:pt-24">
          <div className="pointer-events-none absolute inset-y-10 inset-x-3 hidden rounded-[1.75rem] bg-safely-gradient opacity-90 xl:block" />
          <div className="pointer-events-none absolute inset-y-6 inset-x-8 hidden rounded-[2rem] bg-gradient-to-br from-brand-700/40 via-transparent to-accent-400/30 xl:block" />
          <div className="pointer-events-none absolute left-4 top-1/4 hidden h-56 w-56 rounded-full bg-white/25 blur-3xl xl:block" />

          <div className="relative w-full max-w-lg xl:translate-x-1">
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

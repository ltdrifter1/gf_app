import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth";
import { ensureLaunchCatalog } from "@/lib/bootstrap";

export default async function LandingPage() {
  const user = await getCurrentUser();
  const primaryHref = user ? "/app/chat" : "/register";

  await ensureLaunchCatalog();

  return (
    <div className="relative min-h-[100svh] overflow-hidden">
      {/* Atmosphere — charcoal wash with teal breath */}
      <div className="pointer-events-none absolute inset-0 bg-[#0b0f0e]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(13,148,136,0.28),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(2,132,200,0.18),transparent_50%)]" />
      <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 animate-float rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />

      <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo className="[&_span]:text-white" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link href="/app/chat" className="btn-primary">
                Open Messenger
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost hidden text-white/80 hover:bg-white/10 sm:inline-flex">
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

      <main className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 pb-16 pt-24 text-center">
        <div className="animate-fade-in">
          <Image
            src="/logo.webp"
            alt="Safely"
            width={160}
            height={160}
            priority
            className="mx-auto rounded-[28%] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.65)]"
          />
        </div>

        <h1 className="mt-8 font-display text-5xl font-bold tracking-tight text-white animate-fade-in sm:text-6xl lg:text-7xl [animation-delay:80ms]">
          Safely
        </h1>

        <p className="mt-4 max-w-sm font-display text-xl font-medium text-white/75 animate-fade-in sm:text-2xl [animation-delay:140ms]">
          Find your people.
        </p>

        <div className="mt-10 animate-fade-in [animation-delay:200ms]">
          <Link href={primaryHref} className="btn-primary px-8 py-3.5 text-base">
            {user ? "Open Messenger" : "Join free"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <footer className="absolute inset-x-0 bottom-0 z-10 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Safely
      </footer>
    </div>
  );
}

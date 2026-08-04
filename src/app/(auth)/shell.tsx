"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2 } from "lucide-react";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden lg:grid lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="absolute inset-0 bg-amity-gradient" />
        <div className="absolute -left-20 top-20 h-72 w-72 animate-float rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <Link href="/" className="relative z-10 brightness-0 invert">
          <Logo />
        </Link>
        <div className="relative z-10 max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
            Your gluten-free companion
          </p>
          <h1 className="mt-3 font-display text-5xl font-bold leading-tight text-white">
            Amity
          </h1>
          <p className="mt-3 font-display text-2xl font-semibold text-white/95">
            Find your people.
          </p>
          <p className="mt-4 text-lg text-white/80">
            Messenger, community pages, safe dining, and recipes — a companion
            for gluten-free life.
          </p>
          <div className="mt-8 flex items-center gap-6 text-white/90">
            <Stat n="Feed" l="Share & connect" />
            <Stat n="Chat" l="Live presence" />
            <Stat n="Safe" l="Dining & recipes" />
          </div>
        </div>
        <p className="relative z-10 text-sm text-white/60">
          Community · Messenger · Health
        </p>
      </div>

      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="card p-8">
            <h2 className="font-display text-2xl font-bold text-sage-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-1 text-sage-500 dark:text-sage-400">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold">{n}</p>
      <p className="text-sm text-white/70">{l}</p>
    </div>
  );
}

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

      {/* Left brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="absolute inset-0 bg-circle-gradient" />
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <Link href="/" className="relative z-10 brightness-0 invert">
          <Logo />
        </Link>
        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight text-white">
            Find your Circle.
          </h1>
          <p className="mt-4 text-lg text-white/80">
            The gluten-free social network with an MSN-style messenger —
            community feed, live presence, and people who get it.
          </p>
          <div className="mt-8 flex items-center gap-6 text-white/90">
            <Stat n="Feed" l="Share & connect" />
            <Stat n="Chat" l="Live presence" />
            <Stat n="Pro" l="Premium Lounge" />
          </div>
        </div>
        <p className="relative z-10 text-sm text-white/60">
          Community · Messenger · Premium
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="card p-8">
            <h2 className="font-display text-2xl font-bold text-sage-900 dark:text-white">{title}</h2>
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

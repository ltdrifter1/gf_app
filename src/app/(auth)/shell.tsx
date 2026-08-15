"use client";

import Link from "next/link";
import Image from "next/image";
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

      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0b0f0e] p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(13,148,136,0.25),transparent_55%)]" />
        <Link href="/" className="relative z-10">
          <Logo className="[&_span]:text-white" />
        </Link>
        <div className="relative z-10 mx-auto max-w-sm text-center">
          <Image
            src="/logo.webp"
            alt="Safely"
            width={120}
            height={120}
            className="mx-auto rounded-[28%] shadow-glow"
            priority
          />
          <h1 className="mt-8 font-display text-5xl font-bold text-white">Safely</h1>
          <p className="mt-3 font-display text-xl text-white/75">Find your people.</p>
        </div>
        <p className="relative z-10 text-sm text-white/40">safelyceliac.com</p>
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

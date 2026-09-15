import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LegalFooter } from "@/components/legal-footer";
import { BRAND } from "@/lib/brand";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 pt-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={36} />
          <span className="font-display text-lg font-bold text-sage-900 dark:text-white">{BRAND.name}</span>
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="card p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-sage-400">Lumen · Canada</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-sage-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-sage-500">Last updated {updated}</p>
          <div className="prose-legal mt-8 space-y-4 text-sm leading-relaxed text-sage-700 dark:text-sage-200">
            {children}
          </div>
        </div>
        <LegalFooter className="mt-8 text-center text-xs text-sage-500" />
      </main>
    </div>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";

/** Horizontal App Store–style shelf with snap scrolling. */
export function StoreShelf({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="px-1">
        <h2 className="font-display text-[1.35rem] font-bold tracking-tight text-sage-900 dark:text-white sm:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-sage-500 dark:text-sage-400">{subtitle}</p>
        )}
      </div>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}

export function StoreShelfCard({
  href,
  emoji,
  title,
  description,
  className,
}: {
  href: string;
  emoji: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex w-[9.75rem] shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] bg-white p-4 shadow-[0_2px_12px_-4px_rgba(15,118,110,0.12)] ring-1 ring-black/[0.04] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(15,118,110,0.28)] dark:bg-white/[0.06] dark:ring-white/10",
        className
      )}
    >
      <span className="grid h-12 w-12 place-items-center rounded-[1.1rem] bg-gradient-to-br from-brand-50 to-accent-300/30 text-2xl dark:from-brand-500/20 dark:to-accent-500/10">
        {emoji}
      </span>
      <p className="mt-3 font-semibold leading-snug text-sage-900 dark:text-white">{title}</p>
      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-sage-500 dark:text-sage-400">
        {description}
      </p>
    </Link>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  MENTAL_HEALTH_CATEGORIES,
  PHYSICAL_HEALTH_CATEGORIES,
} from "@/lib/constants";
import { JournalStudio } from "@/components/wellness-widgets";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle, Activity, Brain, BookOpen } from "lucide-react";
import { timeAgo, cn } from "@/lib/utils";

export default async function HealthPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active =
    tab === "mental" ? "mental" : tab === "physical" ? "physical" : "journal";
  const user = await requireUser();

  const [resources, journalEntries, supportPosts] = await Promise.all([
    prisma.healthResource.findMany(),
    prisma.journalEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.post.findMany({
      where: { category: "mental-health" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { author: { select: { name: true, username: true, avatarUrl: true } } },
    }),
  ]);

  const mental = resources.filter((r) => r.pillar === "mental");
  const physical = resources.filter((r) => r.pillar === "physical");

  const initialEntries = journalEntries.map((e) => ({
    id: e.id,
    prompt: e.prompt,
    content: e.content,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="relative overflow-hidden rounded-[1.75rem] border border-white/40 bg-[#0b0f0e] px-6 py-8 text-white shadow-glass sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(13,148,136,0.35),transparent_55%),radial-gradient(ellipse_at_90%_80%,rgba(2,132,200,0.2),transparent_45%)]" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Health
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {active === "journal"
              ? "Journal"
              : active === "mental"
                ? "Mental care"
                : "Physical care"}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-white/70 sm:text-base">
            {active === "journal"
              ? "A quiet place to write — private, unhurried, yours."
              : "Gentle guidance for gluten-free life. Not a substitute for your doctor."}
          </p>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Health sections">
        {(
          [
            { id: "journal", href: "/app/health", label: "Journal", icon: BookOpen },
            { id: "mental", href: "/app/health?tab=mental", label: "Mental", icon: Brain },
            { id: "physical", href: "/app/health?tab=physical", label: "Physical", icon: Activity },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const on = active === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                on
                  ? "bg-sage-900 text-white shadow-soft dark:bg-white dark:text-sage-900"
                  : "bg-white/60 text-sage-600 hover:bg-white dark:bg-white/5 dark:text-sage-300 dark:hover:bg-white/10"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {active === "journal" && <JournalStudio initialEntries={initialEntries} />}

      {active === "mental" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="grid gap-4 sm:grid-cols-2">
            {MENTAL_HEALTH_CATEGORIES.map((c) => {
              const items = mental.filter((r) => r.category === c.slug);
              return (
                <div key={c.slug} className="card p-5">
                  <p className="text-2xl">{c.emoji}</p>
                  <h3 className="mt-2 font-display font-semibold text-sage-900 dark:text-white">
                    {c.label}
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {items.length ? (
                      items.map((r) => (
                        <li key={r.id} className="text-sm text-sage-600 dark:text-sage-300">
                          <span className="font-medium text-sage-800 dark:text-sage-100">
                            {r.title}
                          </span>
                          <span className="mt-0.5 block text-sage-500">{r.content}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-sage-400">More coming soon</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <Link
              href="/app/chat/mental-health"
              className="card flex items-center gap-3 p-5 transition hover:shadow-glass-lg"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-sage-500 text-lg">
                💙
              </div>
              <div>
                <p className="font-semibold text-sage-900 dark:text-white">Mental Health chat</p>
                <p className="text-sm text-sage-500">Talk it through</p>
              </div>
              <MessageCircle className="ml-auto h-5 w-5 text-sage-400" />
            </Link>

            {supportPosts.length > 0 && (
              <div className="card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display font-semibold text-sage-900 dark:text-white">
                    From the community
                  </h3>
                  <Link
                    href="/app?category=mental-health"
                    className="text-xs font-medium text-brand-600 hover:underline"
                  >
                    See all
                  </Link>
                </div>
                <div className="space-y-3">
                  {supportPosts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/app/post/${p.id}`}
                      className="block rounded-xl bg-white/60 p-3 transition hover:bg-brand-50/70 dark:bg-white/5 dark:hover:bg-brand-500/10"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar name={p.author.name} src={p.author.avatarUrl} size={28} />
                        <span className="text-xs font-semibold text-sage-700 dark:text-sage-200">
                          {p.author.name}
                        </span>
                        <span className="ml-auto text-[10px] text-sage-400">
                          {timeAgo(p.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-sm text-sage-800 dark:text-sage-100">
                        {p.title || p.content}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Link href="/app/health" className="btn-secondary w-full justify-center">
              <BookOpen className="h-4 w-4" />
              Open journal
            </Link>
          </div>
        </div>
      )}

      {active === "physical" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {PHYSICAL_HEALTH_CATEGORIES.map((c) => {
            const items = physical.filter((r) => r.category === c.slug);
            return (
              <div key={c.slug} className="card p-5">
                <p className="text-2xl">{c.emoji}</p>
                <h3 className="mt-2 font-display font-semibold text-sage-900 dark:text-white">
                  {c.label}
                </h3>
                <ul className="mt-3 space-y-3">
                  {items.length ? (
                    items.map((r) => (
                      <li key={r.id}>
                        <p className="text-sm font-medium text-sage-800 dark:text-sage-100">
                          {r.title}
                        </p>
                        <p className="mt-0.5 text-sm text-sage-500 dark:text-sage-400">
                          {r.content}
                        </p>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-sage-400">More coming soon</li>
                  )}
                </ul>
              </div>
            );
          })}
          <div className="card col-span-full border border-amber-300/40 bg-amber-50/50 p-5 dark:bg-amber-500/10">
            <p className="text-sm text-sage-700 dark:text-sage-200">
              Educational only — not medical advice. Talk with your doctor or dietitian before
              changing treatment, supplements, or labs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

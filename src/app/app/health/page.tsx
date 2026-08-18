import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ArrowRight, Brain, LineChart, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  MENTAL_HEALTH_CATEGORIES,
  PHYSICAL_HEALTH_CATEGORIES,
} from "@/lib/constants";
import { timeAgo, cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ tab?: string; category?: string }>;
};

export default async function HealthPage({ searchParams }: Props) {
  const params = await searchParams;

  if (params.tab === "journal" || params.tab === "track") {
    redirect(params.tab === "track" ? "/app/journal?tab=track" : "/app/journal");
  }

  await requireUser();

  const tab = params.tab === "physical" ? "physical" : "mental";
  const categories =
    tab === "mental" ? MENTAL_HEALTH_CATEGORIES : PHYSICAL_HEALTH_CATEGORIES;
  const categoryFilter =
    params.category && categories.some((c) => c.slug === params.category)
      ? params.category
      : undefined;

  const [resources, supportPosts] = await Promise.all([
    prisma.healthResource.findMany({
      where: {
        pillar: tab,
        ...(categoryFilter ? { category: categoryFilter } : {}),
      },
      orderBy: { title: "asc" },
    }),
    tab === "mental"
      ? prisma.post.findMany({
          where: { category: "mental-health" },
          orderBy: { createdAt: "desc" },
          take: 3,
          include: {
            author: { select: { name: true, username: true, avatarUrl: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  const byCategory = categories.map((c) => ({
    ...c,
    items: resources.filter((r) => r.category === c.slug),
  }));

  const headlines = {
    mental: {
      title: "Mental care",
      blurb:
        "Anxiety, grief, dating, burnout, family — peer-minded guides for gluten-free life. Not a substitute for therapy or crisis care.",
    },
    physical: {
      title: "Physical care",
      blurb:
        "Gut healing, labs, nutrition, skin, bones, kitchen safety — educational deep dives. Confirm everything with your care team.",
    },
  } as const;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="relative overflow-hidden rounded-[1.75rem] border border-white/40 bg-[#0b0f0e] px-6 py-8 text-white shadow-glass sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(13,148,136,0.35),transparent_55%),radial-gradient(ellipse_at_90%_80%,rgba(2,132,200,0.2),transparent_45%)]" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Health library
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {headlines[tab].title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
            {headlines[tab].blurb}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/app/journal"
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/20"
            >
              Open Journal →
            </Link>
            <Link
              href="/app/journal?tab=track"
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/20"
            >
              Symptom Track →
            </Link>
          </div>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Health sections">
        {(
          [
            { id: "mental", href: "/app/health?tab=mental", label: "Mental", icon: Brain },
            {
              id: "physical",
              href: "/app/health?tab=physical",
              label: "Physical",
              icon: Activity,
            },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const on = tab === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                on
                  ? "bg-sage-900 text-white shadow-soft dark:bg-white dark:text-sage-900"
                  : "bg-white/60 text-sage-600 hover:bg-white dark:bg-white/5 dark:text-sage-300 dark:hover:bg-white/10",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {tab === "mental" ? (
        <div className="rounded-2xl border border-rose-300/30 bg-rose-50/50 px-4 py-3 text-sm text-sage-800 dark:bg-rose-500/10 dark:text-sage-200">
          <p className="font-semibold text-sage-900 dark:text-white">You are not alone in this.</p>
          <p className="mt-1">
            These guides are companions — not crisis care. If you are in danger or thinking of
            harming yourself, contact local emergency services or call/text{" "}
            <a className="font-semibold underline" href="tel:988">
              988
            </a>{" "}
            (US).
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-300/40 bg-amber-50/50 px-4 py-3 text-sm text-sage-800 dark:bg-amber-500/10 dark:text-sage-200">
          <p className="font-semibold text-sage-900 dark:text-white">Educational — not a diagnosis.</p>
          <p className="mt-1">
            Use these to prepare questions for your care team. Always confirm labs, medications, and
            diet changes with a clinician who knows your history.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/app/health?tab=${tab}`}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition",
            !categoryFilter
              ? "bg-sage-900 text-white dark:bg-white dark:text-sage-900"
              : "bg-white/60 text-sage-600 hover:bg-white dark:bg-white/5 dark:text-sage-300",
          )}
        >
          All topics
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/app/health?tab=${tab}&category=${encodeURIComponent(c.slug)}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition",
              categoryFilter === c.slug
                ? "bg-sage-900 text-white dark:bg-white dark:text-sage-900"
                : "bg-white/60 text-sage-600 hover:bg-white dark:bg-white/5 dark:text-sage-300",
            )}
          >
            {c.emoji} {c.label}
          </Link>
        ))}
      </div>

      <div
        className={cn(
          "grid gap-4",
          tab === "mental" && "lg:grid-cols-[1fr_300px]",
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {byCategory
            .filter((c) => c.items.length > 0 || !categoryFilter)
            .map((c) => (
              <div key={c.slug} className="card p-5">
                <p className="text-2xl">{c.emoji}</p>
                <h2 className="mt-2 font-display font-semibold text-sage-900 dark:text-white">
                  {c.label}
                </h2>
                <p className="mt-1 text-xs text-sage-400">
                  {c.items.length} guide{c.items.length === 1 ? "" : "s"}
                </p>
                <ul className="mt-3 space-y-3">
                  {c.items.length ? (
                    c.items.map((r) => (
                      <li key={r.id}>
                        <Link
                          href={`/app/health/r/${r.slug}`}
                          className="group block rounded-xl p-1 transition hover:bg-white/50 dark:hover:bg-white/5"
                        >
                          <span className="flex items-center gap-2 font-medium text-sage-800 group-hover:text-brand-700 dark:text-sage-100 dark:group-hover:text-brand-300">
                            {r.title}
                            {(r.type === "exercise" || r.toolKey) && (
                              <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                                Tool
                              </span>
                            )}
                            <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" />
                          </span>
                          <span className="mt-0.5 block text-sm text-sage-500 line-clamp-2">
                            {r.content}
                          </span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-sage-400">More coming soon</li>
                  )}
                </ul>
              </div>
            ))}
        </div>

        {tab === "mental" ? (
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

            <div className="card border border-rose-300/30 bg-rose-50/50 p-5 dark:bg-rose-500/10">
              <p className="text-sm font-semibold text-sage-900 dark:text-white">Crisis support</p>
              <p className="mt-1 text-sm text-sage-600 dark:text-sage-300">
                If you&apos;re in danger or thinking of harming yourself, contact local emergency
                services or call/text 988 (US).
              </p>
            </div>

            {supportPosts.length > 0 ? (
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
            ) : null}

            <Link href="/app/journal?tab=track" className="btn-secondary w-full justify-center">
              <LineChart className="h-4 w-4" />
              Open Track
            </Link>
            <Link href="/app/journal" className="btn-ghost w-full justify-center">
              Open Journal
            </Link>
          </div>
        ) : null}
      </div>

      {tab === "physical" ? (
        <div className="card border border-amber-300/40 bg-amber-50/50 p-5 dark:bg-amber-500/10">
          <p className="text-sm text-sage-700 dark:text-sage-200">
            Educational only — not medical advice. Talk with your doctor or dietitian before
            changing treatment, supplements, or labs. Pair symptoms with{" "}
            <Link href="/app/journal?tab=track" className="font-semibold text-brand-700 underline">
              Track
            </Link>{" "}
            so appointments start with notes, not guesswork.
          </p>
        </div>
      ) : null}
    </div>
  );
}

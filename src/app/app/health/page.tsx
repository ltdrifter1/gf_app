import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  MENTAL_HEALTH_CATEGORIES,
  PHYSICAL_HEALTH_CATEGORIES,
  MOOD_OPTIONS,
} from "@/lib/constants";
import { MoodTracker, JournalWidget } from "@/components/wellness-widgets";
import { HeartPulse, MessageCircle, Activity, Brain } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default async function HealthPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = tab === "physical" ? "physical" : "mental";
  const user = await requireUser();

  const [resources, moods] = await Promise.all([
    prisma.healthResource.findMany(),
    prisma.moodEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 7,
    }),
  ]);

  const mental = resources.filter((r) => r.pillar === "mental");
  const physical = resources.filter((r) => r.pillar === "physical");

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-rose-300 via-brand-300 to-sage-400 p-8">
          <HeartPulse className="h-8 w-8 text-white" />
          <h1 className="mt-3 font-display text-3xl font-bold text-white">Health</h1>
          <p className="mt-1 max-w-xl text-white/90">
            Mental and physical care for gluten-free life — check in, learn, and go gently.
            Not a substitute for your doctor.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href="/app/health"
          className={`chip border ${
            active === "mental"
              ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
              : "border-transparent bg-white/60 text-sage-600 dark:bg-white/5 dark:text-sage-300"
          }`}
        >
          <Brain className="h-3.5 w-3.5" /> Mental
        </Link>
        <Link
          href="/app/health?tab=physical"
          className={`chip border ${
            active === "physical"
              ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
              : "border-transparent bg-white/60 text-sage-600 dark:bg-white/5 dark:text-sage-300"
          }`}
        >
          <Activity className="h-3.5 w-3.5" /> Physical
        </Link>
      </div>

      {active === "mental" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
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
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-display font-semibold text-sage-900 dark:text-white">
                How are you today?
              </h3>
              <p className="mb-3 text-sm text-sage-500">Daily mood check-in</p>
              <MoodTracker />
            </div>

            {moods.length > 0 && (
              <div className="card p-5">
                <h3 className="font-display font-semibold text-sage-900 dark:text-white">
                  Recent moods
                </h3>
                <div className="mt-3 space-y-2">
                  {moods.map((m) => {
                    const opt = MOOD_OPTIONS.find((o) => o.value === m.mood);
                    return (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 rounded-xl bg-white/60 px-3 py-2 dark:bg-white/5"
                      >
                        <span className="text-xl">{opt?.emoji}</span>
                        <span className="text-sm text-sage-700 dark:text-sage-200">
                          {m.note || opt?.label}
                        </span>
                        <span className="ml-auto text-xs text-sage-400">
                          {timeAgo(m.createdAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="card p-5">
              <h3 className="font-display font-semibold text-sage-900 dark:text-white">
                Guided journaling
              </h3>
              <div className="mt-3">
                <JournalWidget />
              </div>
            </div>

            <Link
              href="/app/chat/mental-health"
              className="card flex items-center gap-3 p-5 transition hover:shadow-glass-lg"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-sage-500 text-lg">
                💙
              </div>
              <div>
                <p className="font-semibold text-sage-900 dark:text-white">
                  Mental Health chat
                </p>
                <p className="text-sm text-sage-500">Talk it through with people who get it</p>
              </div>
              <MessageCircle className="ml-auto h-5 w-5 text-sage-400" />
            </Link>
          </div>
        </div>
      ) : (
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
              Educational only — not medical advice. Talk with your doctor or dietitian
              before changing treatment, supplements, or labs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

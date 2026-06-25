import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { MENTAL_HEALTH_CATEGORIES, MOOD_OPTIONS } from "@/lib/constants";
import { MoodTracker, JournalWidget } from "@/components/wellness-widgets";
import { HeartPulse, MessageCircle, Stethoscope } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default async function MentalHealthPage() {
  const user = await requireUser();
  const [resources, moods] = await Promise.all([
    prisma.mentalHealthResource.findMany(),
    prisma.moodEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 7 }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-rose-300 via-brand-300 to-sage-300 p-8">
          <HeartPulse className="h-8 w-8 text-white" />
          <h1 className="mt-3 font-display text-3xl font-bold text-white">Mental Health Center</h1>
          <p className="mt-1 max-w-xl text-white/90">
            The emotional side of celiac life is real. This is a gentle, non-clinical
            space to check in, reflect, and find support. 💙
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {MENTAL_HEALTH_CATEGORIES.map((c) => {
              const items = resources.filter((r) => r.category === c.slug);
              return (
                <div key={c.slug} className="card p-5">
                  <p className="text-2xl">{c.emoji}</p>
                  <h3 className="mt-2 font-display font-semibold text-sage-900 dark:text-white">{c.label}</h3>
                  <ul className="mt-2 space-y-1.5">
                    {items.length ? items.map((r) => (
                      <li key={r.id} className="text-sm text-sage-600 dark:text-sage-300">• {r.title}</li>
                    )) : <li className="text-sm text-sage-400">More resources coming soon</li>}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="card p-5">
            <h3 className="flex items-center gap-2 font-display font-semibold text-sage-900 dark:text-white">
              <Stethoscope className="h-4 w-4 text-brand-600" /> Therapist directory
            </h3>
            <p className="mt-1 text-sm text-sage-500 dark:text-sage-400">
              Find gluten-aware, chronic-illness-informed therapists. Browse verified professionals in the Experts hub.
            </p>
            <Link href="/app/experts" className="btn-secondary mt-3">Browse experts</Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-display font-semibold text-sage-900 dark:text-white">How are you today?</h3>
            <p className="mb-3 text-sm text-sage-500">Daily mood check-in</p>
            <MoodTracker />
          </div>

          {moods.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display font-semibold text-sage-900 dark:text-white">Your recent moods</h3>
              <div className="mt-3 space-y-2">
                {moods.map((m) => {
                  const opt = MOOD_OPTIONS.find((o) => o.value === m.mood);
                  return (
                    <div key={m.id} className="flex items-center gap-3 rounded-xl bg-white/60 dark:bg-white/5 px-3 py-2">
                      <span className="text-xl">{opt?.emoji}</span>
                      <span className="text-sm text-sage-700 dark:text-sage-200">{m.note || opt?.label}</span>
                      <span className="ml-auto text-xs text-sage-400">{timeAgo(m.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="card p-5">
            <h3 className="font-display font-semibold text-sage-900 dark:text-white">Guided journaling</h3>
            <div className="mt-3"><JournalWidget /></div>
          </div>

          <Link href="/app/chat/mental-health" className="card flex items-center gap-3 p-5 hover:shadow-glass-lg transition">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-sage-500 text-lg">💙</div>
            <div>
              <p className="font-semibold text-sage-900 dark:text-white">Mental Health chat room</p>
              <p className="text-sm text-sage-500">Talk it through with people who get it</p>
            </div>
            <MessageCircle className="ml-auto h-5 w-5 text-sage-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}

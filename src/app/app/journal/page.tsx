import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { inferJourneyStageFromGoals } from "@/lib/constants";
import { JournalStudio } from "@/components/wellness-widgets";
import { HealthTrackPanel } from "@/components/health-track";
import { BookOpen, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { isSameDay } from "date-fns";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = tab === "track" ? "track" : "journal";
  const user = await requireUser();

  const [journalEntries, moodEntries, healthLogs, profile] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
    prisma.moodEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    prisma.healthLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const journeyStage =
    profile?.journeyStage ||
    inferJourneyStageFromGoals(profile?.goals) ||
    "newly-diagnosed";

  const initialEntries = journalEntries.map((e) => ({
    id: e.id,
    prompt: e.prompt,
    content: e.content,
    mood: e.mood,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  const initialMoods = moodEntries.map((e) => ({
    id: e.id,
    mood: e.mood,
    note: e.note,
    shareToProfile: e.shareToProfile,
    createdAt: e.createdAt.toISOString(),
  }));

  const now = new Date();
  const todaysMoodEntry = moodEntries.find((e) => isSameDay(e.createdAt, now));
  const todayMood = todaysMoodEntry?.mood ?? null;
  const hasMoodToday = Boolean(todaysMoodEntry);

  const initialLogs = healthLogs.map((e) => ({
    id: e.id,
    kind: e.kind,
    severity: e.severity,
    note: e.note,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-sage-900 dark:text-white sm:text-3xl">
            {active === "track" ? "Track" : "Journal"}
          </h1>
          <p className="mt-1 max-w-md text-sm text-sage-500">
            {active === "track"
              ? "Mood and glutening notes — private unless you choose to share status."
              : "Private, unhurried, yours — continue today or open any past page."}
          </p>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Journal sections">
          {(
            [
              { id: "journal", href: "/app/journal", label: "Write", icon: BookOpen },
              { id: "track", href: "/app/journal?tab=track", label: "Track", icon: LineChart },
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
      </header>

      {active === "journal" ? (
        <JournalStudio
          initialEntries={initialEntries}
          journeyStage={journeyStage}
          todayMood={todayMood}
          hasMoodToday={hasMoodToday}
        />
      ) : (
        <HealthTrackPanel initialMoods={initialMoods} initialLogs={initialLogs} />
      )}
    </div>
  );
}

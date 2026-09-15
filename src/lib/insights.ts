/**
 * Private, opt-in pattern insights from mood + health logs + journal.
 * Gentle, never public, never scolding — and never a diagnosis.
 */

export type InsightInput = {
  moods: { mood: number; createdAt: Date | string; note?: string | null }[];
  logs: { kind: string; severity: number; note?: string | null; createdAt: Date | string }[];
  journals: { content: string; createdAt: Date | string }[];
};

export type PatternInsight = {
  key: string;
  title: string;
  body: string;
  href?: string;
};

function asDate(d: Date | string) {
  return typeof d === "string" ? new Date(d) : d;
}

function daysAgo(n: number) {
  return Date.now() - n * 86_400_000;
}

const DINING_RE = /\b(restaurant|dining|ate out|eat out|menu|takeout|take-out|dinner out)\b/i;

export function buildPatternInsights(input: InsightInput, now = Date.now()): PatternInsight[] {
  const insights: PatternInsight[] = [];
  const moods = input.moods.map((m) => ({ ...m, at: asDate(m.createdAt).getTime() }));
  const logs = input.logs.map((l) => ({ ...l, at: asDate(l.createdAt).getTime() }));
  const journals = input.journals.map((j) => ({ ...j, at: asDate(j.createdAt).getTime() }));

  const glutenings = logs.filter((l) => l.kind === "glutening");
  const recentGlutenings = glutenings.filter((l) => l.at >= daysAgo(14));
  const prevGlutenings = glutenings.filter((l) => l.at < daysAgo(14) && l.at >= daysAgo(28));

  if (recentGlutenings.length >= 2) {
    insights.push({
      key: "glutening-cluster-14d",
      title: "A few rough exposures lately",
      body: "You logged more than one glutening in the last two weeks. No lecture — rest, simple food, and extra softness are allowed. Recovery tips are here when you want them.",
      href: "/app/health?tab=physical&category=recovery",
    });
  } else if (recentGlutenings.length > prevGlutenings.length && recentGlutenings.length >= 1 && prevGlutenings.length >= 1) {
    insights.push({
      key: "glutening-up-vs-prior",
      title: "A little more than last fortnight",
      body: "Glutenings ticked up compared with the two weeks before. Could be coincidence. If dining out was in the mix, a backup snack in the bag is a kind favour to future-you.",
      href: "/app/journal?tab=track",
    });
  }

  const diningJournalHits = journals.filter((j) => DINING_RE.test(j.content) && j.at >= daysAgo(30));
  let diningThenGlutening = 0;
  for (const j of diningJournalHits) {
    const hit = glutenings.some((g) => g.at >= j.at && g.at - j.at <= 2 * 86_400_000);
    if (hit) diningThenGlutening += 1;
  }
  if (diningThenGlutening >= 2) {
    insights.push({
      key: "dining-then-glutening",
      title: "Dining out, then a glutening",
      body: "A couple of journal notes about eating out sat close to a glutening log. Not proof of anything — just a gentle pattern. Dedicated kitchens and a plan-B meal help some people exhale.",
      href: "/app/restaurants",
    });
  }

  const afterGlutenMoods: number[] = [];
  for (const g of glutenings.filter((l) => l.at >= daysAgo(45))) {
    const nearby = moods.filter((m) => m.at >= g.at && m.at - g.at <= 3 * 86_400_000);
    afterGlutenMoods.push(...nearby.map((m) => m.mood));
  }
  const baselineMoods = moods.filter((m) => m.at >= daysAgo(45)).map((m) => m.mood);
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  if (afterGlutenMoods.length >= 2 && baselineMoods.length >= 4 && avg(afterGlutenMoods) <= avg(baselineMoods) - 0.6) {
    insights.push({
      key: "mood-dip-after-glutening",
      title: "Mood dipped after glutenings",
      body: "That's a common pairing, not a character review. Extra rest those days is a strategy, not a failure. The Mental Health room gets it if you want company.",
      href: "/app/chat/mental-health",
    });
  }

  const recentMoods = moods.filter((m) => m.at >= daysAgo(7));
  if (recentMoods.length >= 3 && recentMoods.every((m) => m.mood <= 2) && glutenings.filter((g) => g.at >= daysAgo(7)).length === 0) {
    insights.push({
      key: "low-mood-streak",
      title: "A heavy week on the check-ins",
      body: "A few low-mood days in a row, even without a glutening log. You're allowed to take up space in Messenger or just drink water and watch something gentle.",
      href: "/app/chat/mental-health",
    });
  }

  if (insights.length === 0 && (moods.length >= 3 || logs.length >= 2 || journals.length >= 2)) {
    insights.push({
      key: "enough-data-kind",
      title: "No loud pattern — that's okay",
      body: "There's enough private data to glance at, and nothing jumped out as a scolding slide. Keep logging only if it feels useful. You're not a project.",
      href: "/app/journal",
    });
  }

  void now;
  return insights.slice(0, 3);
}

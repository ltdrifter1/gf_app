/** Goal → community room slug + feed category matching for onboarding. */

export const COMPANION_GOALS = [
  {
    slug: "dining",
    label: "Safe dining near me",
    hint: "Find spots where you can exhale",
    roomSlug: "general-support",
    category: "restaurants",
  },
  {
    slug: "newly-diagnosed",
    label: "I'm newly diagnosed",
    hint: "Starter tips & friendly company",
    roomSlug: "newly-diagnosed",
    category: "newly-diagnosed",
  },
  {
    slug: "support",
    label: "Emotional support",
    hint: "Talk with people who get it",
    roomSlug: "mental-health",
    category: "mental-health",
  },
  {
    slug: "parents",
    label: "Raising a celiac kid",
    hint: "Parents & caregivers, unite",
    roomSlug: "parents",
    category: "newly-diagnosed",
  },
  {
    slug: "recipes",
    label: "GF recipes & cooking",
    hint: "Kitchen wins that actually taste good",
    roomSlug: "general-support",
    category: "recipes",
  },
] as const;

export type CompanionGoalSlug = (typeof COMPANION_GOALS)[number]["slug"];

export function parseGoals(raw: string | null | undefined): CompanionGoalSlug[] {
  if (!raw) return [];
  const allowed = new Set(COMPANION_GOALS.map((g) => g.slug));
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is CompanionGoalSlug => allowed.has(s as CompanionGoalSlug));
}

export function primaryRoomForGoals(goals: CompanionGoalSlug[]): string {
  if (goals.includes("newly-diagnosed")) return "newly-diagnosed";
  if (goals.includes("parents")) return "parents";
  if (goals.includes("support")) return "mental-health";
  return "general-support";
}

export function cityFromLocation(location: string | null | undefined): string | null {
  if (!location) return null;
  const city = location.split(",")[0]?.trim();
  return city || null;
}

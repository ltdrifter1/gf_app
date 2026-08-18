/** Primary feed topics — keep the Community feed to one clear job. */
export const POST_CATEGORIES = [
  { slug: "newly-diagnosed", label: "Newly diagnosed", emoji: "🌱", color: "bg-sage-100 text-sage-700" },
  { slug: "restaurants", label: "Dining", emoji: "🍽️", color: "bg-amber-100 text-amber-700" },
  { slug: "mental-health", label: "Support", emoji: "💙", color: "bg-brand-100 text-brand-700" },
  { slug: "travel", label: "Travel", emoji: "✈️", color: "bg-sky-100 text-sky-700" },
] as const;

/** Labels for older seeded/legacy post categories still in the DB. */
const LEGACY_CATEGORIES: Record<string, { label: string; emoji: string; color: string }> = {
  symptoms: { label: "Symptoms", emoji: "🩺", color: "bg-rose-100 text-rose-700" },
  recipes: { label: "Recipes", emoji: "👩‍🍳", color: "bg-orange-100 text-orange-700" },
  "product-reviews": { label: "Products", emoji: "🛒", color: "bg-violet-100 text-violet-700" },
  "kids-with-celiac": { label: "Kids", emoji: "🧒", color: "bg-pink-100 text-pink-700" },
};

export function categoryBySlug(slug: string) {
  const primary = POST_CATEGORIES.find((c) => c.slug === slug);
  if (primary) return primary;
  const legacy = LEGACY_CATEGORIES[slug];
  if (legacy) return { slug, ...legacy };
  return undefined;
}

export const RECIPE_CATEGORIES = [
  "Quick Meals",
  "Baking",
  "Family",
  "Budget",
  "Vegan",
  "High Protein",
  "Kids",
] as const;

export const MENTAL_HEALTH_CATEGORIES = [
  { slug: "anxiety", label: "Anxiety Support", emoji: "🌊" },
  { slug: "depression", label: "Low Mood", emoji: "🌤️" },
  { slug: "isolation", label: "Feeling Isolated", emoji: "🤝" },
  { slug: "eating-out", label: "Eating Out Nerves", emoji: "🍴" },
  { slug: "newly-diagnosed", label: "Newly Diagnosed", emoji: "🌱" },
] as const;

export const PHYSICAL_HEALTH_CATEGORIES = [
  { slug: "gut", label: "Gut & Digestion", emoji: "🦠" },
  { slug: "nutrition", label: "Nutrition & Deficits", emoji: "🥗" },
  { slug: "recovery", label: "Healing After Glutening", emoji: "💚" },
  { slug: "energy", label: "Energy & Fatigue", emoji: "⚡" },
  { slug: "labs", label: "Labs & Follow-up", emoji: "🔬" },
] as const;

export const MOOD_OPTIONS = [
  { value: 1, label: "Struggling", emoji: "😞" },
  { value: 2, label: "Low", emoji: "😕" },
  { value: 3, label: "Okay", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Great", emoji: "😄" },
] as const;

/** Where someone is in their gluten-free / celiac journey. */
export const JOURNEY_STAGES = [
  {
    slug: "newly-diagnosed",
    label: "Newly diagnosed",
    hint: "Still learning the basics",
  },
  {
    slug: "intermediate",
    label: "Finding my rhythm",
    hint: "A few months to a couple of years in",
  },
  {
    slug: "experienced",
    label: "Experienced",
    hint: "Long-time GF — steady habits, maybe mentoring",
  },
  {
    slug: "caregiver",
    label: "Caregiver / family",
    hint: "Supporting someone else’s GF life",
  },
] as const;

export type JourneyStageSlug = (typeof JOURNEY_STAGES)[number]["slug"];

export const JOURNAL_PROMPTS_BY_STAGE: Record<JourneyStageSlug, string[]> = {
  "newly-diagnosed": [
    "What tiny win showed up this week — even if it was just reading one label correctly?",
    "Which ingredient still feels like a riddle? Write the question you’d ask a patient friend.",
    "Where did you feel safest eating lately, and what made it feel okay?",
    "What’s one boundary around food you want to practice saying out loud (even in the mirror)?",
    "Name three foods you’re glad you can still enjoy.",
    "Write a kind note to yourself for the next confusing grocery trip.",
    "Who made this week a little easier — and how?",
    "What’s one funny or weird thing you’ve learned about gluten-free life so far?",
  ],
  intermediate: [
    "What routine is finally clicking — and what still makes you laugh-cry?",
    "Describe a moment you advocated for yourself without over-explaining.",
    "Where did joy sneak into a meal this week?",
    "What boundary around plans do you want to honor this month?",
    "How did you recover after a rough day — rest, soup, Messenger, all of the above?",
    "What would you tell newly diagnosed you from where you stand now?",
    "Which relationship with food feels kinder than it did six months ago?",
    "Write about a dining or travel idea you’re curious to try again.",
  ],
  experienced: [
    "What wisdom would you pass along today — short, kind, no lecture energy?",
    "Where did you feel safest eating this week, and what did experience teach you?",
    "How are you supporting others without burning your own toast?",
    "What “I should have this figured out” thought are you ready to retire?",
    "Describe a moment you still felt anxious — and how you took care of yourself after.",
    "What gluten-free habit are you quietly proud of?",
    "Where do you still want growth: travel, cooking, advocacy, or community?",
    "Write a soft note to tomorrow-you for a hard day. Veterans need kindness too.",
  ],
  caregiver: [
    "What went well supporting someone’s gluten-free needs today?",
    "Where did advocacy feel heavy — and what would make next time lighter?",
    "How are you caring for yourself while you care for them?",
    "What question do you still wish schools or restaurants answered clearly?",
    "Describe a win at a meal, school event, or trip that used to feel impossible.",
    "What boundary do you need around food prep or other people’s opinions?",
    "Who supports you as the caregiver — and how can you ask for a little more of that?",
    "Write a note of encouragement to them (or to yourself). Softness counts.",
  ],
};

/** Flat list kept for backwards compatibility; prefer promptsForJourneyStage(). */
export const JOURNAL_PROMPTS = Object.values(JOURNAL_PROMPTS_BY_STAGE).flat();

export function promptsForJourneyStage(
  stage: string | null | undefined
): string[] {
  const match = JOURNEY_STAGES.find((s) => s.slug === stage);
  if (match) return JOURNAL_PROMPTS_BY_STAGE[match.slug];
  return JOURNAL_PROMPTS_BY_STAGE["newly-diagnosed"];
}

export function journeyStageLabel(stage: string | null | undefined): string {
  return JOURNEY_STAGES.find((s) => s.slug === stage)?.label ?? "Newly diagnosed";
}

/** Infer a stage from onboarding goals when journeyStage isn’t set yet. */
export function inferJourneyStageFromGoals(
  goalsCsv: string | null | undefined
): JourneyStageSlug {
  if (!goalsCsv) return "newly-diagnosed";
  const goals = goalsCsv.split(",").map((g) => g.trim());
  if (goals.includes("parents")) return "caregiver";
  if (goals.includes("newly-diagnosed")) return "newly-diagnosed";
  return "intermediate";
}

export const HEALTH_LOG_KINDS = [
  { slug: "glutening", label: "Glutening", hint: "Accidental exposure" },
  { slug: "symptom", label: "Symptom", hint: "Gut, energy, skin…" },
  { slug: "flare", label: "Flare", hint: "Multi-day rough patch" },
] as const;

export const SEVERITY_LABELS = ["Mild", "Low", "Moderate", "Hard", "Severe"] as const;

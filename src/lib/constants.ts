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
  { slug: "isolation", label: "Social Isolation", emoji: "🤝" },
  { slug: "eating-out", label: "Eating Out Anxiety", emoji: "🍴" },
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

export const JOURNAL_PROMPTS = [
  "What is one thing that went well with your gluten-free journey today?",
  "Describe a moment you felt supported recently.",
  "What is a worry you'd like to let go of?",
  "Name three foods you're grateful you can still enjoy.",
  "What would you tell someone newly diagnosed today?",
  "Where did you feel safest eating this week?",
  "What boundary around food or plans do you want to honor?",
  "Write a short note to tomorrow-you after a hard day.",
];

export const HEALTH_LOG_KINDS = [
  { slug: "glutening", label: "Glutening", hint: "Accidental exposure" },
  { slug: "symptom", label: "Symptom", hint: "Gut, energy, skin…" },
  { slug: "flare", label: "Flare", hint: "Multi-day rough patch" },
] as const;

export const SEVERITY_LABELS = ["Mild", "Low", "Moderate", "Hard", "Severe"] as const;

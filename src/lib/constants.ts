export const POST_CATEGORIES = [
  { slug: "newly-diagnosed", label: "Newly Diagnosed", emoji: "🌱", color: "bg-sage-100 text-sage-700" },
  { slug: "symptoms", label: "Symptoms", emoji: "🩺", color: "bg-rose-100 text-rose-700" },
  { slug: "restaurants", label: "Restaurants", emoji: "🍽️", color: "bg-amber-100 text-amber-700" },
  { slug: "recipes", label: "Recipes", emoji: "👩‍🍳", color: "bg-orange-100 text-orange-700" },
  { slug: "mental-health", label: "Mental Health", emoji: "💙", color: "bg-brand-100 text-brand-700" },
  { slug: "travel", label: "Travel", emoji: "✈️", color: "bg-sky-100 text-sky-700" },
  { slug: "product-reviews", label: "Product Reviews", emoji: "🛒", color: "bg-violet-100 text-violet-700" },
  { slug: "kids-with-celiac", label: "Kids With Celiac", emoji: "🧒", color: "bg-pink-100 text-pink-700" },
  { slug: "research", label: "Research", emoji: "🔬", color: "bg-teal-100 text-teal-700" },
] as const;

export function categoryBySlug(slug: string) {
  return POST_CATEGORIES.find((c) => c.slug === slug);
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

export const PRODUCT_CATEGORIES = [
  "Bread & Bakery",
  "Snacks",
  "Pasta & Grains",
  "Breakfast",
  "Condiments",
  "Baking",
  "Frozen",
] as const;

export const MENTAL_HEALTH_CATEGORIES = [
  { slug: "anxiety", label: "Anxiety Support", emoji: "🌊" },
  { slug: "depression", label: "Depression Support", emoji: "🌤️" },
  { slug: "isolation", label: "Social Isolation", emoji: "🤝" },
  { slug: "eating-out", label: "Eating Out Anxiety", emoji: "🍴" },
  { slug: "newly-diagnosed", label: "Newly Diagnosed Adjustment", emoji: "🌱" },
] as const;

export const KNOWLEDGE_TOPICS = [
  { slug: "basics", label: "Celiac Disease Basics" },
  { slug: "newly-diagnosed", label: "Newly Diagnosed Guide" },
  { slug: "long-term", label: "Long-term Management" },
  { slug: "deficiencies", label: "Nutritional Deficiencies" },
  { slug: "family-planning", label: "Family Planning" },
  { slug: "pediatric", label: "Pediatric Celiac Disease" },
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
];

export const PREMIUM_PRICE_USD = 9;
export const PREMIUM_AI_CREDITS = 200;

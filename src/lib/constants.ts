export const POST_CATEGORIES = [
  { slug: "newly-diagnosed", label: "Newly Diagnosed", emoji: "🌱", color: "bg-sage-100 text-sage-700" },
  { slug: "symptoms", label: "Symptoms", emoji: "🩺", color: "bg-rose-100 text-rose-700" },
  { slug: "restaurants", label: "Dining Tips", emoji: "🍽️", color: "bg-amber-100 text-amber-700" },
  { slug: "recipes", label: "Recipes", emoji: "👩‍🍳", color: "bg-orange-100 text-orange-700" },
  { slug: "mental-health", label: "Support", emoji: "💙", color: "bg-brand-100 text-brand-700" },
  { slug: "travel", label: "Travel", emoji: "✈️", color: "bg-sky-100 text-sky-700" },
  { slug: "product-reviews", label: "Products", emoji: "🛒", color: "bg-violet-100 text-violet-700" },
  { slug: "kids-with-celiac", label: "Kids", emoji: "🧒", color: "bg-pink-100 text-pink-700" },
] as const;

export function categoryBySlug(slug: string) {
  return POST_CATEGORIES.find((c) => c.slug === slug);
}

export const PREMIUM_PRICE_USD = 9;

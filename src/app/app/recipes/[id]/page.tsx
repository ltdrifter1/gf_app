import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Flame, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Stars } from "@/components/star-rating";
import { RecipeRatingForm } from "@/components/recipe-rating-form";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";

export default async function RecipeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const r = await prisma.recipe.findUnique({
    where: { id },
    include: {
      author: true,
      ratings: { include: { user: true }, orderBy: { createdAt: "desc" } },
      savedBy: { where: { userId: user.id }, select: { id: true } },
    },
  });
  if (!r) notFound();

  const ingredients = (r.ingredients as string[]) ?? [];
  const steps = (r.steps as string[]) ?? [];
  const avg = r.ratings.length ? r.ratings.reduce((s, x) => s + x.rating, 0) / r.ratings.length : 0;
  const nutrition = [
    { label: "Calories", value: `${r.calories}` },
    { label: "Protein", value: `${r.protein}g` },
    { label: "Carbs", value: `${r.carbs}g` },
    { label: "Fat", value: `${r.fat}g` },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Link href="/app/recipes" className="btn-ghost w-fit">
        <ArrowLeft className="h-4 w-4" /> All recipes
      </Link>

      <div className="card overflow-hidden">
        {r.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.imageUrl} alt={r.title} className="h-64 w-full object-cover sm:h-80" />
        )}
        <div className="p-6">
          <span className="chip bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">{r.category}</span>
          <h1 className="mt-2 font-display text-3xl font-bold text-sage-900 dark:text-white">{r.title}</h1>
          <p className="mt-2 text-sage-700 dark:text-sage-200">{r.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-sage-500">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {r.prepTime}m prep · {r.cookTime}m cook</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {r.servings} servings</span>
            <span className="flex items-center gap-1.5"><Flame className="h-4 w-4" /> {r.calories} cal</span>
            <span className="flex items-center gap-1.5"><Stars value={avg} /> {avg ? `${avg.toFixed(1)} (${r.ratings.length})` : "No ratings yet"}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Ingredients</h2>
            <ul className="mt-3 space-y-2">
              {ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-3 text-sage-700 dark:text-sage-200">
                  <span className="h-2 w-2 rounded-full bg-brand-500" /> {ing}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Method</h2>
            <ol className="mt-3 space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span>
                  <p className="pt-0.5 text-sage-700 dark:text-sage-200">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Community reviews</h2>
            <div className="mt-3 space-y-3">
              {r.ratings.filter((x) => x.review).map((rev) => (
                <div key={rev.id} className="flex gap-3">
                  <Avatar name={rev.user.name} src={rev.user.avatarUrl} size={36} />
                  <div className="flex-1 rounded-2xl bg-white/60 dark:bg-white/5 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-sage-900 dark:text-white">{rev.user.name}</p>
                      <Stars value={rev.rating} />
                    </div>
                    <p className="mt-1 text-sm text-sage-700 dark:text-sage-200">{rev.review}</p>
                    <p className="mt-1 text-xs text-sage-400">{timeAgo(rev.createdAt)}</p>
                  </div>
                </div>
              ))}
              {r.ratings.filter((x) => x.review).length === 0 && (
                <p className="text-sm text-sage-400">No written reviews yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-display font-semibold text-sage-900 dark:text-white">Nutrition (per serving)</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {nutrition.map((n) => (
                <div key={n.label} className="rounded-2xl bg-white/60 dark:bg-white/5 p-3 text-center">
                  <p className="font-display text-xl font-bold text-sage-900 dark:text-white">{n.value}</p>
                  <p className="text-xs text-sage-500">{n.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Avatar name={r.author.name} src={r.author.avatarUrl} size={36} />
              <div>
                <p className="text-sm font-semibold text-sage-900 dark:text-white">{r.author.name}</p>
                <p className="text-xs text-sage-400">Recipe author</p>
              </div>
            </div>
            <RecipeRatingForm recipeId={r.id} saved={r.savedBy.length > 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

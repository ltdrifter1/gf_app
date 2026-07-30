import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { RECIPE_CATEGORIES } from "@/lib/constants";
import { Stars } from "@/components/star-rating";
import { Clock, Flame, Search } from "lucide-react";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
}) {
  const { category, q, sort } = await searchParams;
  await requireUser();
  const query = (q || "").trim();
  const sortBy = sort === "rating" || sort === "quick" ? sort : "newest";

  const recipes = await prisma.recipe.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
              { category: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { author: true, ratings: { select: { rating: true } } },
  });

  const withAvg = recipes.map((r) => ({
    ...r,
    avg: r.ratings.length
      ? r.ratings.reduce((s, x) => s + x.rating, 0) / r.ratings.length
      : 0,
    totalTime: r.prepTime + r.cookTime,
  }));

  if (sortBy === "rating") {
    withAvg.sort((a, b) => b.avg - a.avg || b.ratings.length - a.ratings.length);
  } else if (sortBy === "quick") {
    withAvg.sort((a, b) => a.totalTime - b.totalTime);
  }

  function href(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const next = {
      category,
      q: query || undefined,
      sort: sortBy !== "newest" ? sortBy : undefined,
      ...overrides,
    };
    for (const [k, v] of Object.entries(next)) {
      if (v) params.set(k, v);
    }
    const s = params.toString();
    return s ? `/app/recipes?${s}` : "/app/recipes";
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">
          Recipes
        </h1>
        <p className="text-sage-500 dark:text-sage-400">
          Trusted gluten-free recipes from the community.
        </p>
      </div>

      <form action="/app/recipes" className="relative">
        {category && <input type="hidden" name="category" value={category} />}
        {sortBy !== "newest" && <input type="hidden" name="sort" value={sortBy} />}
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search recipes…"
          className="input pl-11"
        />
      </form>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["newest", "Newest"],
            ["rating", "Top rated"],
            ["quick", "Quickest"],
          ] as const
        ).map(([key, label]) => (
          <Link
            key={key}
            href={href({ sort: key === "newest" ? undefined : key })}
            className={`chip border ${
              sortBy === key
                ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                : "border-transparent bg-white/60 text-sage-600 dark:bg-white/5 dark:text-sage-300"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href={href({ category: undefined })}
          className={`chip shrink-0 border ${
            !category
              ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
              : "border-transparent bg-white/60 text-sage-600 dark:bg-white/5 dark:text-sage-300"
          }`}
        >
          All
        </Link>
        {RECIPE_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={href({ category: c })}
            className={`chip shrink-0 border ${
              category === c
                ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                : "border-transparent bg-white/60 text-sage-600 dark:bg-white/5 dark:text-sage-300"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {withAvg.map((r) => (
          <Link
            key={r.id}
            href={`/app/recipes/${r.id}`}
            className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-glass-lg"
          >
            <div className="h-44 overflow-hidden bg-sage-100">
              {r.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.imageUrl}
                  alt={r.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              )}
            </div>
            <div className="p-4">
              <span className="chip bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                {r.category}
              </span>
              <h3 className="mt-2 font-display font-semibold text-sage-900 dark:text-white">
                {r.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-sage-500 dark:text-sage-400">
                {r.description}
              </p>
              <p className="mt-2 text-xs text-sage-400">by {r.author.name}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-sage-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {r.totalTime}m
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" /> {r.calories} cal
                </span>
                <span className="ml-auto flex items-center gap-1">
                  <Stars value={r.avg} /> {r.avg ? r.avg.toFixed(1) : "New"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {withAvg.length === 0 && (
        <div className="card p-10 text-center text-sage-500">
          No recipes match. Try another search or category.
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Search, MapPin, ChefHat, ShoppingBasket, FileText } from "lucide-react";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  await requireUser();
  const query = (q || "").trim();

  const [posts, restaurants, recipes, products] = query
    ? await Promise.all([
        prisma.post.findMany({ where: { OR: [{ title: { contains: query } }, { content: { contains: query } }] }, take: 6, include: { author: true } }),
        prisma.restaurant.findMany({ where: { OR: [{ name: { contains: query } }, { city: { contains: query } }, { cuisine: { contains: query } }] }, take: 6 }),
        prisma.recipe.findMany({ where: { OR: [{ title: { contains: query } }, { description: { contains: query } }] }, take: 6 }),
        prisma.product.findMany({ where: { OR: [{ name: { contains: query } }, { brand: { contains: query } }] }, take: 6 }),
      ])
    : [[], [], [], []];

  const total = posts.length + restaurants.length + recipes.length + products.length;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form action="/app/search" className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" />
        <input name="q" defaultValue={query} placeholder="Search everything…" className="input pl-11" autoFocus />
      </form>

      {query && <p className="text-sm text-sage-500">{total} results for “{query}”</p>}

      {posts.length > 0 && (
        <Section title="Posts" icon={FileText}>
          {posts.map((p) => (
            <Link key={p.id} href={`/app/post/${p.id}`} className="block rounded-2xl bg-white/60 dark:bg-white/5 p-3 hover:bg-white/90 dark:hover:bg-white/10">
              <p className="font-medium text-sage-900 dark:text-white">{p.title}</p>
              <p className="text-xs text-sage-500">by {p.author.name}</p>
            </Link>
          ))}
        </Section>
      )}
      {restaurants.length > 0 && (
        <Section title="Restaurants" icon={MapPin}>
          {restaurants.map((r) => (
            <Link key={r.id} href={`/app/restaurants/${r.id}`} className="block rounded-2xl bg-white/60 dark:bg-white/5 p-3 hover:bg-white/90 dark:hover:bg-white/10">
              <p className="font-medium text-sage-900 dark:text-white">{r.name}</p>
              <p className="text-xs text-sage-500">{r.city} · {r.communityConfidence}% confidence</p>
            </Link>
          ))}
        </Section>
      )}
      {recipes.length > 0 && (
        <Section title="Recipes" icon={ChefHat}>
          {recipes.map((r) => (
            <Link key={r.id} href={`/app/recipes/${r.id}`} className="block rounded-2xl bg-white/60 dark:bg-white/5 p-3 hover:bg-white/90 dark:hover:bg-white/10">
              <p className="font-medium text-sage-900 dark:text-white">{r.title}</p>
              <p className="text-xs text-sage-500">{r.category}</p>
            </Link>
          ))}
        </Section>
      )}
      {products.length > 0 && (
        <Section title="Products" icon={ShoppingBasket}>
          {products.map((p) => (
            <Link key={p.id} href={`/app/products/${p.id}`} className="block rounded-2xl bg-white/60 dark:bg-white/5 p-3 hover:bg-white/90 dark:hover:bg-white/10">
              <p className="font-medium text-sage-900 dark:text-white">{p.name}</p>
              <p className="text-xs text-sage-500">{p.brand}</p>
            </Link>
          ))}
        </Section>
      )}

      {query && total === 0 && <div className="card p-8 text-center text-sage-500">No results found. Try a different search.</div>}
      {!query && <div className="card p-8 text-center text-sage-500">Search posts, restaurants, recipes, and products.</div>}
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="mb-3 flex items-center gap-2 font-display font-semibold text-sage-900 dark:text-white">
        <Icon className="h-4 w-4 text-brand-600" /> {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

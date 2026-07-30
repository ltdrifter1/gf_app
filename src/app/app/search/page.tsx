import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Search, FileText, MapPin, ChefHat, Users, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  await requireUser();
  const query = (q || "").trim();

  const [posts, restaurants, recipes, people, rooms] = query
    ? await Promise.all([
        prisma.post.findMany({
          where: {
            OR: [{ title: { contains: query } }, { content: { contains: query } }],
          },
          take: 6,
          include: { author: true },
        }),
        prisma.restaurant.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { city: { contains: query } },
              { cuisine: { contains: query } },
            ],
          },
          take: 6,
        }),
        prisma.recipe.findMany({
          where: {
            OR: [{ title: { contains: query } }, { description: { contains: query } }],
          },
          take: 6,
        }),
        prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { username: { contains: query } },
            ],
          },
          take: 6,
        }),
        prisma.chatRoom.findMany({
          where: {
            isCommunity: true,
            OR: [{ name: { contains: query } }, { description: { contains: query } }],
          },
          take: 4,
        }),
      ])
    : [[], [], [], [], []];

  const total =
    posts.length + restaurants.length + recipes.length + people.length + rooms.length;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form action="/app/search" className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search posts, restaurants, recipes…"
          className="input pl-11"
          autoFocus
        />
      </form>

      {query && (
        <p className="text-sm text-sage-500">
          {total} results for “{query}”
        </p>
      )}

      {posts.length > 0 && (
        <Section title="Posts" icon={FileText}>
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/app/post/${p.id}`}
              className="block rounded-2xl bg-white/60 p-3 hover:bg-white/90 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <p className="font-medium text-sage-900 dark:text-white">{p.title}</p>
              <p className="text-xs text-sage-500">by {p.author.name}</p>
            </Link>
          ))}
        </Section>
      )}
      {restaurants.length > 0 && (
        <Section title="Restaurants" icon={MapPin}>
          {restaurants.map((r) => (
            <Link
              key={r.id}
              href={`/app/restaurants/${r.id}`}
              className="block rounded-2xl bg-white/60 p-3 hover:bg-white/90 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <p className="font-medium text-sage-900 dark:text-white">{r.name}</p>
              <p className="text-xs text-sage-500">
                {r.city} · {r.communityConfidence}% confidence
              </p>
            </Link>
          ))}
        </Section>
      )}
      {recipes.length > 0 && (
        <Section title="Recipes" icon={ChefHat}>
          {recipes.map((r) => (
            <Link
              key={r.id}
              href={`/app/recipes/${r.id}`}
              className="block rounded-2xl bg-white/60 p-3 hover:bg-white/90 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <p className="font-medium text-sage-900 dark:text-white">{r.title}</p>
              <p className="text-xs text-sage-500">{r.category}</p>
            </Link>
          ))}
        </Section>
      )}
      {people.length > 0 && (
        <Section title="People" icon={Users}>
          {people.map((u) => (
            <Link
              key={u.id}
              href="/app/profile"
              className="flex items-center gap-3 rounded-2xl bg-white/60 p-3 hover:bg-white/90 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <Avatar name={u.name} src={u.avatarUrl} size={36} presence={u.presence} />
              <div>
                <p className="font-medium text-sage-900 dark:text-white">{u.name}</p>
                <p className="text-xs text-sage-500">@{u.username}</p>
              </div>
            </Link>
          ))}
        </Section>
      )}
      {rooms.length > 0 && (
        <Section title="Rooms" icon={MessageCircle}>
          {rooms.map((r) => (
            <Link
              key={r.id}
              href={`/app/chat/${r.slug}`}
              className="block rounded-2xl bg-white/60 p-3 hover:bg-white/90 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <p className="font-medium text-sage-900 dark:text-white">{r.name}</p>
              <p className="text-xs text-sage-500">{r.description}</p>
            </Link>
          ))}
        </Section>
      )}

      {query && total === 0 && (
        <div className="card p-8 text-center text-sage-500">
          No results found. Try a different search.
        </div>
      )}
      {!query && (
        <div className="card p-8 text-center text-sage-500">
          Search posts, restaurants, recipes, people, and rooms.
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <h2 className="mb-3 flex items-center gap-2 font-display font-semibold text-sage-900 dark:text-white">
        <Icon className="h-4 w-4 text-brand-600" /> {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

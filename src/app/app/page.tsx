import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { POST_CATEGORIES, categoryBySlug } from "@/lib/constants";
import { PostComposer } from "@/components/post-composer";
import { PostCard, type PostCardData } from "@/components/post-card";
import { cn } from "@/lib/utils";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; scope?: string }>;
}) {
  const { category, scope } = await searchParams;
  const user = await requireUser();
  const followingOnly = scope === "following";

  let authorFilter: { authorId?: string | { in: string[] } } = {};
  if (followingOnly) {
    const follows = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });
    const ids = follows.map((f) => f.followingId);
    authorFilter = { authorId: { in: [...ids, user.id] } };
  }

  const posts = await prisma.post.findMany({
    where: {
      ...(category ? { category } : {}),
      ...authorFilter,
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      author: true,
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: user.id }, select: { id: true } },
      savedBy: { where: { userId: user.id }, select: { id: true } },
    },
  });

  const data: PostCardData[] = posts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    imageUrl: p.imageUrl,
    category: p.category,
    createdAt: p.createdAt.toISOString(),
    author: {
      name: p.author.name,
      username: p.author.username,
      avatarUrl: p.author.avatarUrl,
      presence: p.author.presence,
    },
    likeCount: p._count.likes,
    commentCount: p._count.comments,
    likedByMe: p.likes.length > 0,
    savedByMe: p.savedBy.length > 0,
  }));

  const activeCat = category ? categoryBySlug(category) : null;

  function feedHref(overrides: { category?: string | null; scope?: string | null }) {
    const params = new URLSearchParams();
    const nextCat = overrides.category === null ? undefined : overrides.category ?? category;
    const nextScope =
      overrides.scope === null ? undefined : overrides.scope ?? (followingOnly ? "following" : undefined);
    if (nextCat) params.set("category", nextCat);
    if (nextScope) params.set("scope", nextScope);
    const s = params.toString();
    return s ? `/app?${s}` : "/app";
  }

  const title = activeCat
    ? activeCat.label
    : followingOnly
      ? "Following"
      : "Community";

  const subtitle = activeCat
    ? "Posts in this topic"
    : followingOnly
      ? "From people you follow"
      : "Share and find your people";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1 pt-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-500">
          Today
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-sage-900 dark:text-white sm:text-4xl">
          {activeCat ? (
            <span className="inline-flex items-center gap-2">
              <span aria-hidden>{activeCat.emoji}</span>
              {title}
            </span>
          ) : (
            title
          )}
        </h1>
        <p className="text-[15px] text-sage-500 dark:text-sage-400">{subtitle}</p>
      </header>

      {/* iOS segmented control */}
      <div className="inline-flex rounded-full bg-black/[0.05] p-1 dark:bg-white/10">
        <Link
          href={feedHref({ scope: null })}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-semibold transition",
            !followingOnly
              ? "bg-white text-sage-900 shadow-soft dark:bg-white/20 dark:text-white"
              : "text-sage-500 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-200"
          )}
        >
          All
        </Link>
        <Link
          href={feedHref({ scope: "following" })}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-semibold transition",
            followingOnly
              ? "bg-white text-sage-900 shadow-soft dark:bg-white/20 dark:text-white"
              : "text-sage-500 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-200"
          )}
        >
          Following
        </Link>
      </div>

      {/* Topic shelf */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href={feedHref({ category: null })}
          className={cn(
            "snap-start shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
            !category
              ? "bg-sage-900 text-white dark:bg-white dark:text-sage-900"
              : "bg-white/80 text-sage-600 ring-1 ring-black/[0.06] hover:bg-white dark:bg-white/[0.06] dark:text-sage-300 dark:ring-white/10"
          )}
        >
          All topics
        </Link>
        {POST_CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={feedHref({ category: c.slug })}
            className={cn(
              "snap-start shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
              category === c.slug
                ? "bg-sage-900 text-white dark:bg-white dark:text-sage-900"
                : "bg-white/80 text-sage-600 ring-1 ring-black/[0.06] hover:bg-white dark:bg-white/[0.06] dark:text-sage-300 dark:ring-white/10"
            )}
          >
            <span className="mr-1" aria-hidden>
              {c.emoji}
            </span>
            {c.label}
          </Link>
        ))}
      </div>

      <PostComposer user={{ name: user.name, avatarUrl: user.avatarUrl }} />

      {data.length === 0 ? (
        <div className="rounded-[1.5rem] bg-white px-8 py-14 text-center shadow-[0_2px_16px_-6px_rgba(15,118,110,0.14)] ring-1 ring-black/[0.04] dark:bg-white/[0.05] dark:ring-white/10">
          <p className="text-[15px] text-sage-500 dark:text-sage-400">
            {followingOnly
              ? "No posts from people you follow yet. Find someone in Messenger."
              : "No posts yet here. Be the first to share something."}
          </p>
          {followingOnly && (
            <Link href="/app/chat" className="btn-secondary mt-5 inline-flex">
              Open Messenger
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { POST_CATEGORIES, categoryBySlug } from "@/lib/constants";
import { PostComposer } from "@/components/post-composer";
import { PostCard, type PostCardData } from "@/components/post-card";

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

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">
          {activeCat
            ? `${activeCat.emoji} ${activeCat.label}`
            : followingOnly
              ? "Following"
              : "Community"}
        </h1>
        <p className="text-sage-500 dark:text-sage-400">
          {activeCat
            ? "Posts in this topic"
            : followingOnly
              ? "Posts from people you follow"
              : "Share and find your people"}
        </p>
      </div>

      <div className="flex gap-2">
        <Link
          href={feedHref({ scope: null })}
          className={`chip border ${
            !followingOnly
              ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
              : "border-transparent bg-white/60 text-sage-600 dark:bg-white/5 dark:text-sage-300"
          }`}
        >
          All
        </Link>
        <Link
          href={feedHref({ scope: "following" })}
          className={`chip border ${
            followingOnly
              ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
              : "border-transparent bg-white/60 text-sage-600 dark:bg-white/5 dark:text-sage-300"
          }`}
        >
          Following
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href={feedHref({ category: null })}
          className={`chip shrink-0 border ${
            !category
              ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
              : "border-transparent bg-white/60 text-sage-600 dark:bg-white/5 dark:text-sage-300"
          }`}
        >
          All topics
        </Link>
        {POST_CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={feedHref({ category: c.slug })}
            className={`chip shrink-0 border ${
              category === c.slug
                ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                : "border-transparent bg-white/60 text-sage-600 dark:bg-white/5 dark:text-sage-300"
            }`}
          >
            <span>{c.emoji}</span> {c.label}
          </Link>
        ))}
      </div>

      <PostComposer user={{ name: user.name, avatarUrl: user.avatarUrl }} />

      {data.length === 0 ? (
        <div className="card space-y-3 p-10 text-center text-sage-500 dark:text-sage-400">
          <p>
            {followingOnly
              ? "No posts from people you follow yet. Find someone in Messenger."
              : "No posts yet here. Be the first to share something."}
          </p>
          {followingOnly && (
            <Link href="/app/chat" className="btn-secondary inline-flex">
              Open Messenger
            </Link>
          )}
        </div>
      ) : (
        data.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  );
}

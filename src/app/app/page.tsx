import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { POST_CATEGORIES, categoryBySlug } from "@/lib/constants";
import { PostComposer } from "@/components/post-composer";
import { PostCard, type PostCardData } from "@/components/post-card";
import { MessageCircle, TrendingUp } from "lucide-react";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const user = await requireUser();

  const posts = await prisma.post.findMany({
    where: category ? { category } : undefined,
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

  return (
    <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">
            {activeCat ? `${activeCat.emoji} ${activeCat.label}` : "Community"}
          </h1>
          <p className="text-sage-500 dark:text-sage-400">
            {activeCat ? "Posts in this topic" : "Your feed — fresh from your Circle"}
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <Link
            href="/app"
            className={`chip shrink-0 border ${
              !category
                ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                : "border-transparent bg-white/60 text-sage-600 dark:bg-white/5 dark:text-sage-300"
            }`}
          >
            ✨ All
          </Link>
          {POST_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/app?category=${c.slug}`}
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
          <div className="card p-10 text-center text-sage-500 dark:text-sage-400">
            No posts yet here. Be the first to share something 🌱
          </div>
        ) : (
          data.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>

      <aside className="hidden space-y-4 lg:block">
        <Link
          href="/app/chat"
          className="card block overflow-hidden transition hover:shadow-glass-lg"
        >
          <div className="bg-circle-gradient p-5 text-white">
            <MessageCircle className="h-6 w-6" />
            <h3 className="mt-2 font-display text-lg font-semibold">Open Messenger</h3>
            <p className="mt-1 text-sm text-white/80">
              Jump into a room — presence on, people waiting.
            </p>
          </div>
        </Link>

        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-display font-semibold text-sage-900 dark:text-white">
            <TrendingUp className="h-4 w-4 text-brand-600" /> Topics
          </h3>
          <div className="mt-3 space-y-1">
            {POST_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/app?category=${c.slug}`}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-sage-600 hover:bg-sage-100/60 dark:text-sage-300 dark:hover:bg-white/5"
              >
                <span>{c.emoji}</span> {c.label}
              </Link>
            ))}
          </div>
        </div>

        <Link href="/app/saved" className="card block p-5 transition hover:shadow-glass-lg">
          <h3 className="font-display font-semibold text-sage-900 dark:text-white">
            Saved posts
          </h3>
          <p className="text-sm text-sage-500 dark:text-sage-400">
            Your bookmarked threads, in one place.
          </p>
        </Link>
      </aside>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PostCard, type PostCardData } from "@/components/post-card";
import { Bookmark } from "lucide-react";

export default async function SavedPage() {
  const user = await requireUser();
  const saved = await prisma.savedPost.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        include: {
          author: true,
          _count: { select: { likes: true, comments: true } },
          likes: { where: { userId: user.id }, select: { id: true } },
        },
      },
    },
  });

  const data: PostCardData[] = saved.map(({ post: p }) => ({
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
    savedByMe: true,
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-sage-900 dark:text-white">
        <Bookmark className="h-6 w-6 text-brand-600" /> Saved posts
      </h1>
      {data.length === 0 ? (
        <div className="card p-10 text-center text-sage-500 dark:text-sage-400">
          Nothing saved yet. Tap the bookmark on any post to keep it here.
        </div>
      ) : (
        data.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  );
}

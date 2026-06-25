import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PostCard, type PostCardData } from "@/components/post-card";
import { CommentForm } from "@/components/comment-form";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: user.id }, select: { id: true } },
      savedBy: { where: { userId: user.id }, select: { id: true } },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!post) notFound();

  const data: PostCardData = {
    id: post.id,
    title: post.title,
    content: post.content,
    imageUrl: post.imageUrl,
    category: post.category,
    createdAt: post.createdAt.toISOString(),
    author: {
      name: post.author.name,
      username: post.author.username,
      avatarUrl: post.author.avatarUrl,
      presence: post.author.presence,
    },
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    likedByMe: post.likes.length > 0,
    savedByMe: post.savedBy.length > 0,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/app" className="btn-ghost w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to feed
      </Link>

      <PostCard post={data} />

      <div className="card p-5">
        <h2 className="font-display font-semibold text-sage-900 dark:text-white">
          {post.comments.length} comments
        </h2>
        <div className="mt-4">
          <CommentForm postId={post.id} user={{ name: user.name, avatarUrl: user.avatarUrl }} />
        </div>

        <div className="mt-5 space-y-4">
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar name={c.author.name} src={c.author.avatarUrl} size={36} />
              <div className="flex-1 rounded-2xl bg-white/60 dark:bg-white/5 px-4 py-2.5">
                <p className="text-sm">
                  <span className="font-semibold text-sage-900 dark:text-white">{c.author.name}</span>
                  <span className="ml-2 text-xs text-sage-400">{timeAgo(c.createdAt)}</span>
                </p>
                <p className="mt-0.5 text-sage-700 dark:text-sage-200">{c.content}</p>
              </div>
            </div>
          ))}
          {post.comments.length === 0 && (
            <p className="text-center text-sm text-sage-400">Be the first to comment — kindness goes a long way 💙</p>
          )}
        </div>
      </div>
    </div>
  );
}

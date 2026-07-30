import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { PostCard, type PostCardData } from "@/components/post-card";
import { FollowButton } from "@/components/follow-button";
import { MessageButton } from "@/components/message-button";
import { MapPin, Calendar } from "lucide-react";
import { effectivePresence } from "@/lib/presence";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const me = await requireUser();

  const profileUser = await prisma.user.findUnique({
    where: { username },
    include: { profile: true },
  });
  if (!profileUser) notFound();

  if (profileUser.id === me.id) redirect("/app/profile");

  const [posts, followers, following, isFollowing] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: profileUser.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId: me.id } },
        savedBy: { where: { userId: me.id } },
      },
    }),
    prisma.follow.count({ where: { followingId: profileUser.id } }),
    prisma.follow.count({ where: { followerId: profileUser.id } }),
    prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: me.id,
          followingId: profileUser.id,
        },
      },
    }),
  ]);

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

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="card overflow-hidden">
        <div className="h-28 bg-ycn-gradient" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-wrap items-end gap-4">
            <div className="rounded-full ring-4 ring-white dark:ring-[#141d19]">
              <Avatar
                name={profileUser.name}
                src={profileUser.avatarUrl}
                size={88}
                presence={effectivePresence(profileUser.presence, profileUser.lastSeen)}
              />
            </div>
            <div className="mb-2 flex-1">
              <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">
                {profileUser.name}
              </h1>
              <p className="text-sage-500 dark:text-sage-400">@{profileUser.username}</p>
            </div>
            <div className="mb-2 flex gap-2">
              <FollowButton
                targetUserId={profileUser.id}
                initiallyFollowing={!!isFollowing}
              />
              <MessageButton targetUserId={profileUser.id} />
            </div>
          </div>
          {profileUser.bio && (
            <p className="mt-4 text-sage-700 dark:text-sage-200">{profileUser.bio}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-sage-500">
            {profileUser.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {profileUser.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Joined{" "}
              {profileUser.createdAt.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </span>
            {profileUser.profile?.diagnosis &&
              profileUser.profile.diagnosis !== "unspecified" && (
                <span className="chip bg-sage-100 capitalize text-sage-600 dark:bg-white/10 dark:text-sage-300">
                  {profileUser.profile.diagnosis.replace("-", " ")}
                </span>
              )}
          </div>
          <div className="mt-4 flex gap-6">
            <div>
              <span className="font-display text-lg font-bold text-sage-900 dark:text-white">
                {posts.length}
              </span>{" "}
              <span className="text-sm text-sage-500">posts</span>
            </div>
            <div>
              <span className="font-display text-lg font-bold text-sage-900 dark:text-white">
                {followers}
              </span>{" "}
              <span className="text-sm text-sage-500">followers</span>
            </div>
            <div>
              <span className="font-display text-lg font-bold text-sage-900 dark:text-white">
                {following}
              </span>{" "}
              <span className="text-sm text-sage-500">following</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="px-1 font-display text-lg font-semibold text-sage-900 dark:text-white">
        Posts
      </h2>
      {data.length === 0 ? (
        <div className="card p-8 text-center text-sage-500">No posts yet.</div>
      ) : (
        data.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  );
}

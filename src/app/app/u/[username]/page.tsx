import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { MyspaceProfile } from "@/components/myspace-profile";
import { getTopFriends } from "@/lib/actions/profile";
import type { PostCardData } from "@/components/post-card";

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

  const isOwn = profileUser.id === me.id;

  const [posts, followers, following, isFollowing, topFriends, recipes, diningReviews] =
    await Promise.all([
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
      isOwn
        ? Promise.resolve(null)
        : prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: me.id,
                followingId: profileUser.id,
              },
            },
          }),
      getTopFriends(profileUser.id),
      prisma.recipe.findMany({
        where: { authorId: profileUser.id },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, title: true, category: true, imageUrl: true },
      }),
      prisma.restaurantReview.findMany({
        where: { userId: profileUser.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          restaurant: { select: { id: true, name: true, city: true, imageUrl: true } },
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
    <MyspaceProfile
      data={{
        id: profileUser.id,
        name: profileUser.name,
        username: profileUser.username,
        bio: profileUser.bio,
        location: profileUser.location,
        avatarUrl: profileUser.avatarUrl,
        presence: profileUser.presence,
        lastSeen: profileUser.lastSeen,
        createdAt: profileUser.createdAt,
        diagnosis: profileUser.profile?.diagnosis,
        mood: profileUser.profile?.mood,
        likeToMeet: profileUser.profile?.likeToMeet,
        interests: profileUser.profile?.interests,
        postCount: posts.length,
        followerCount: followers,
        followingCount: following,
        isOwn,
        viewerId: me.id,
        isFollowing: !!isFollowing,
        topFriends,
        posts: data,
        recipes,
        diningReviews: diningReviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          safetyRating: r.safetyRating,
          content: r.content,
          restaurant: r.restaurant,
        })),
        editSlot: isOwn ? (
          <Link href="/app/profile" className="btn-secondary w-full">
            Edit your page
          </Link>
        ) : undefined,
      }}
    />
  );
}

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { MyspaceProfile } from "@/components/myspace-profile";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { getTopFriends } from "@/lib/actions/profile";
import type { PostCardData } from "@/components/post-card";

export default async function ProfilePage() {
  const user = await requireUser();
  const [posts, followers, following, fullUser, topFriends] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId: user.id } },
        savedBy: { where: { userId: user.id } },
      },
    }),
    prisma.follow.count({ where: { followingId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
    prisma.user.findUnique({ where: { id: user.id }, include: { profile: true } }),
    getTopFriends(user.id),
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
        id: user.id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        location: user.location,
        avatarUrl: user.avatarUrl,
        presence: user.presence,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        diagnosis: fullUser?.profile?.diagnosis,
        mood: fullUser?.profile?.mood,
        likeToMeet: fullUser?.profile?.likeToMeet,
        interests: fullUser?.profile?.interests,
        postCount: posts.length,
        followerCount: followers,
        followingCount: following,
        isOwn: true,
        topFriends,
        posts: data,
        editSlot: (
          <ProfileEditForm
            username={user.username}
            initial={{
              name: user.name,
              bio: user.bio || "",
              location: user.location || "",
              diagnosis: fullUser?.profile?.diagnosis || "unspecified",
              avatarUrl: user.avatarUrl || "",
              presence: user.presence,
              mood: fullUser?.profile?.mood || "",
              likeToMeet: fullUser?.profile?.likeToMeet || "",
              interests: fullUser?.profile?.interests || "",
            }}
          />
        ),
      }}
    />
  );
}

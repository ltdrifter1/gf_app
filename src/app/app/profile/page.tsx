import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { PostCard, type PostCardData } from "@/components/post-card";
import { Crown, MapPin, Calendar } from "lucide-react";

export default async function ProfilePage() {
  const user = await requireUser();
  const [posts, followers, following, savedRecipes, fullUser] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      include: { author: true, _count: { select: { likes: true, comments: true } }, likes: { where: { userId: user.id } }, savedBy: { where: { userId: user.id } } },
    }),
    prisma.follow.count({ where: { followingId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
    prisma.savedRecipe.findMany({ where: { userId: user.id }, include: { recipe: true } }),
    prisma.user.findUnique({ where: { id: user.id }, include: { profile: true } }),
  ]);

  const data: PostCardData[] = posts.map((p) => ({
    id: p.id, title: p.title, content: p.content, imageUrl: p.imageUrl, category: p.category,
    createdAt: p.createdAt.toISOString(),
    author: { name: p.author.name, username: p.author.username, avatarUrl: p.author.avatarUrl, presence: p.author.presence },
    likeCount: p._count.likes, commentCount: p._count.comments, likedByMe: p.likes.length > 0, savedByMe: p.savedBy.length > 0,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="card overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-brand-400 to-sage-500" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end gap-4">
            <div className="rounded-full ring-4 ring-white dark:ring-[#141d19]">
              <Avatar name={user.name} src={user.avatarUrl} size={88} presence={user.presence} />
            </div>
            <div className="mb-2 flex-1">
              <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-sage-900 dark:text-white">
                {user.name}
                {user.isPremium && <span className="chip bg-warm-400/20 text-warm-500"><Crown className="h-3 w-3" /> Premium</span>}
              </h1>
              <p className="text-sage-500 dark:text-sage-400">@{user.username}</p>
            </div>
          </div>
          <p className="mt-4 text-sage-700 dark:text-sage-200">{user.bio}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-sage-500">
            {user.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {user.location}</span>}
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined {user.createdAt.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
            {fullUser?.profile?.diagnosis && fullUser.profile.diagnosis !== "unspecified" && (
              <span className="chip bg-sage-100 text-sage-600 dark:bg-white/10 dark:text-sage-300 capitalize">{fullUser.profile.diagnosis.replace("-", " ")}</span>
            )}
          </div>
          <div className="mt-4 flex gap-6">
            <div><span className="font-display text-lg font-bold text-sage-900 dark:text-white">{posts.length}</span> <span className="text-sm text-sage-500">posts</span></div>
            <div><span className="font-display text-lg font-bold text-sage-900 dark:text-white">{followers}</span> <span className="text-sm text-sage-500">followers</span></div>
            <div><span className="font-display text-lg font-bold text-sage-900 dark:text-white">{following}</span> <span className="text-sm text-sage-500">following</span></div>
          </div>
        </div>
      </div>

      {savedRecipes.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display font-semibold text-sage-900 dark:text-white">Saved recipes</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {savedRecipes.map((s) => (
              <Link key={s.id} href={`/app/recipes/${s.recipe.id}`} className="chip bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                {s.recipe.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <h2 className="px-1 font-display text-lg font-semibold text-sage-900 dark:text-white">Your posts</h2>
      {data.length === 0 ? (
        <div className="card p-8 text-center text-sage-500">You haven't posted yet. Share something with the community!</div>
      ) : (
        data.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  );
}

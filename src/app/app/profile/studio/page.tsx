import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ProfileStudioForm } from "@/components/profile-studio-form";
import { studioLookFromProfile } from "@/lib/profile-theme";

export default async function ProfileStudioPage() {
  const user = await requireUser();
  const [full, following, followers, topEight] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, include: { profile: true } }),
    prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: { select: { id: true, name: true, username: true, avatarUrl: true } },
      },
    }),
    prisma.follow.findMany({
      where: { followingId: user.id },
      include: {
        follower: { select: { id: true, name: true, username: true, avatarUrl: true } },
      },
    }),
    prisma.topEightFriend.findMany({
      where: { ownerId: user.id },
      orderBy: { position: "asc" },
    }),
  ]);

  const byId = new Map<string, { id: string; name: string; username: string; avatarUrl: string | null }>();
  for (const f of following) byId.set(f.following.id, f.following);
  for (const f of followers) byId.set(f.follower.id, f.follower);
  byId.delete(user.id);

  const look = studioLookFromProfile(full?.profile);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-sage-400">You · Customize</p>
        <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">Profile Studio</h1>
        <p className="mt-1 text-sm text-sage-500">
          Make{" "}
          <Link href={`/app/u/${user.username}`} className="font-semibold text-brand-600 hover:underline">
            /app/u/{user.username}
          </Link>{" "}
          feel like your page — skins, wallpaper, Top 8, module order. Bio and diagnosis still live on Edit Profile.
        </p>
      </div>
      <ProfileStudioForm
        look={look}
        friends={[...byId.values()]}
        topEightIds={topEight.map((t) => t.friendId)}
        username={user.username}
      />
    </div>
  );
}

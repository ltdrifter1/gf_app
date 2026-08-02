import Link from "next/link";
import type { ReactNode } from "react";
import { MapPin, Calendar } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { FollowButton } from "@/components/follow-button";
import { MessageButton } from "@/components/message-button";
import { PostCard, type PostCardData } from "@/components/post-card";
import { MoodTracker } from "@/components/wellness-widgets";
import { effectivePresence } from "@/lib/presence";

export type TopFriend = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  presence: string;
  lastSeen: Date | string;
};

export type ProfileRecipe = {
  id: string;
  title: string;
  category: string;
  imageUrl: string | null;
};

export type ProfileDiningReview = {
  id: string;
  rating: number;
  safetyRating: number;
  content: string;
  restaurant: { id: string; name: string; city: string; imageUrl: string | null };
};

export type MyspaceProfileData = {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  presence: string;
  lastSeen: Date | string;
  createdAt: Date;
  diagnosis?: string | null;
  mood?: string | null;
  likeToMeet?: string | null;
  interests?: string | null;
  postCount: number;
  followerCount: number;
  followingCount: number;
  isOwn: boolean;
  viewerId?: string;
  isFollowing?: boolean;
  topFriends: TopFriend[];
  posts: PostCardData[];
  recipes?: ProfileRecipe[];
  diningReviews?: ProfileDiningReview[];
  editSlot?: ReactNode;
};

function Section({
  title,
  children,
  accent = "brand",
}: {
  title: string;
  children: ReactNode;
  accent?: "brand" | "teal" | "sage";
}) {
  const bar =
    accent === "teal"
      ? "from-teal-500 to-brand-500"
      : accent === "sage"
        ? "from-sage-500 to-brand-400"
        : "from-brand-600 to-accent-500";
  return (
    <section className="overflow-hidden rounded-2xl border border-white/50 bg-white/55 shadow-soft dark:border-white/10 dark:bg-white/[0.04]">
      <div
        className={`bg-gradient-to-r ${bar} px-3 py-1.5 text-sm font-bold tracking-wide text-white`}
        style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.35)" }}
      >
        {title}
      </div>
      <div className="p-3 text-sm text-sage-700 dark:text-sage-200">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-2 border-b border-sage-100 py-1.5 last:border-0 dark:border-white/5">
      <dt className="font-semibold text-brand-700 dark:text-brand-300">{label}</dt>
      <dd className="whitespace-pre-wrap text-sage-700 dark:text-sage-200">{value}</dd>
    </div>
  );
}

export function MyspaceProfile({ data }: { data: MyspaceProfileData }) {
  const status = effectivePresence(data.presence, data.lastSeen);
  const mood = data.mood?.trim() || null;
  const about = data.bio?.trim() || null;
  const likeToMeet = data.likeToMeet?.trim() || null;
  const interests = data.interests?.trim() || null;
  const diagnosis =
    data.diagnosis && data.diagnosis !== "unspecified"
      ? data.diagnosis.replace("-", " ")
      : null;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* Display name + mood — classic MySpace header strip */}
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-sage-900 dark:text-white">
            {data.name}
          </h1>
          <p className="text-sage-500">@{data.username}</p>
        </div>
        <p className="rounded-xl bg-white/60 px-3 py-1.5 text-sm text-sage-700 dark:bg-white/5 dark:text-sage-200">
          <span className="font-semibold text-brand-700 dark:text-brand-300">Mood:</span>{" "}
          {mood || (status === "online" ? "Online in COM-C" : status === "away" ? "Away" : "Offline")}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* —— Left column: photo / contact / blurbs —— */}
        <aside className="space-y-3">
          <Section title={`${data.name}'s Profile Pic`}>
            <div className="flex flex-col items-center gap-3">
              <Avatar
                name={data.name}
                src={data.avatarUrl}
                size={168}
                presence={status}
                className="rounded-2xl"
              />
              <div className="flex w-full justify-center gap-4 text-center text-xs text-sage-500">
                <div>
                  <p className="font-display text-base font-bold text-sage-900 dark:text-white">
                    {data.postCount}
                  </p>
                  posts
                </div>
                <div>
                  <p className="font-display text-base font-bold text-sage-900 dark:text-white">
                    {data.followerCount}
                  </p>
                  friends
                </div>
                <div>
                  <p className="font-display text-base font-bold text-sage-900 dark:text-white">
                    {data.followingCount}
                  </p>
                  following
                </div>
              </div>
            </div>
          </Section>

          <Section title="Contacting" accent="teal">
            {data.isOwn ? (
              <div className="space-y-2">{data.editSlot}</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <MessageButton targetUserId={data.id} />
                <FollowButton
                  targetUserId={data.id}
                  initiallyFollowing={!!data.isFollowing}
                />
              </div>
            )}
          </Section>

          {data.isOwn && (
            <Section title="Mood check-in" accent="sage">
              <MoodTracker />
            </Section>
          )}

          <Section title={`${data.name}'s Blurbs`}>
            <dl>
              <DetailRow label="About me" value={about || "Still writing this…"} />
              <DetailRow
                label="I'd like to meet"
                value={likeToMeet || "Anyone navigating celiac or GF life"}
              />
              <DetailRow label="Interests" value={interests} />
              <DetailRow label="Diagnosis" value={diagnosis} />
            </dl>
          </Section>

          <Section title={`${data.name}'s Details`} accent="sage">
            <dl>
              {data.location && (
                <div className="flex items-center gap-1.5 border-b border-sage-100 py-1.5 dark:border-white/5">
                  <MapPin className="h-3.5 w-3.5 text-brand-600" />
                  <span>{data.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 py-1.5">
                <Calendar className="h-3.5 w-3.5 text-brand-600" />
                <span>
                  Member since{" "}
                  {data.createdAt.toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </dl>
          </Section>
        </aside>

        {/* —— Right column: blog + Top 8 —— */}
        <div className="space-y-3">
          <Section title={`${data.name}'s Blog`} accent="teal">
            {data.posts.length === 0 ? (
              <p className="py-6 text-center text-sage-400">
                {data.isOwn
                  ? "No blog posts yet — share something with the community."
                  : "No blog posts yet."}
              </p>
            ) : (
              <div className="space-y-3">
                {data.posts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            )}
          </Section>

          <Section title={`${data.name}'s Friend Space`}>
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-sage-400">
                {data.name}&apos;s Top 8
              </p>
              <Link
                href={data.isOwn ? "/app/search" : `/app/u/${data.username}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                {data.followerCount + data.followingCount} friends
              </Link>
            </div>
            {data.topFriends.length === 0 ? (
              <p className="py-6 text-center text-sage-400">
                {data.isOwn
                  ? "Follow people to fill your Top 8."
                  : "No friends listed yet."}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {data.topFriends.map((f, i) => (
                  <Link
                    key={f.id}
                    href={`/app/u/${f.username}`}
                    className="group flex flex-col items-center rounded-xl p-2 text-center transition hover:bg-brand-50/80 dark:hover:bg-brand-500/10"
                  >
                    <span className="mb-1 text-[10px] font-bold text-sage-400">#{i + 1}</span>
                    <Avatar
                      name={f.name}
                      src={f.avatarUrl}
                      size={64}
                      presence={effectivePresence(f.presence, f.lastSeen)}
                    />
                    <span className="mt-1.5 line-clamp-2 text-xs font-semibold text-brand-700 group-hover:underline dark:text-brand-300">
                      {f.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Section>

          {(data.recipes?.length ?? 0) > 0 && (
            <Section title={`${data.name}'s Recipes`} accent="sage">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {data.recipes!.map((r) => (
                  <Link
                    key={r.id}
                    href={`/app/recipes/${r.id}`}
                    className="group overflow-hidden rounded-xl border border-white/40 bg-white/50 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="aspect-[4/3] bg-sage-100 dark:bg-sage-800">
                      {r.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.imageUrl}
                          alt=""
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="line-clamp-2 text-xs font-semibold text-sage-900 group-hover:text-brand-700 dark:text-white">
                        {r.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-sage-400">{r.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {(data.diningReviews?.length ?? 0) > 0 && (
            <Section title={`${data.name}'s Dining`} accent="teal">
              <div className="space-y-2">
                {data.diningReviews!.map((rev) => (
                  <Link
                    key={rev.id}
                    href={`/app/restaurants/${rev.restaurant.id}`}
                    className="flex gap-3 rounded-xl border border-white/40 bg-white/50 p-2 transition hover:bg-brand-50/70 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-brand-500/10"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-sage-100 dark:bg-sage-800">
                      {rev.restaurant.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rev.restaurant.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-sage-900 dark:text-white">
                        {rev.restaurant.name}
                      </p>
                      <p className="text-xs text-sage-400">
                        {rev.restaurant.city} · ★{rev.rating} · safety {rev.safetyRating}/5
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-sage-600 dark:text-sage-300">
                        {rev.content}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

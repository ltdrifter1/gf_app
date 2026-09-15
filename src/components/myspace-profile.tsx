import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { MapPin, Calendar } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { FollowButton } from "@/components/follow-button";
import { MessageButton } from "@/components/message-button";
import { BlockMuteButtons } from "@/components/block-mute-buttons";
import { PostCard, type PostCardData } from "@/components/post-card";
import { MoodTracker } from "@/components/wellness-widgets";
import { SafeImg } from "@/components/safe-img";
import { effectivePresence } from "@/lib/presence";
import { safeImageSrc } from "@/lib/safe-image";
import {
  PROFILE_THEMES,
  accentClass,
  defaultStudioLook,
  flairClass,
  parseModuleOrder,
  type ProfileModuleId,
  type StudioLook,
} from "@/lib/profile-theme";

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

export type WallComment = {
  id: string;
  content: string;
  createdAt: Date | string;
  author: { id: string; name: string; username: string; avatarUrl: string | null };
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
  blockedByMe?: boolean;
  mutedByMe?: boolean;
  topFriends: TopFriend[];
  posts: PostCardData[];
  recipes?: ProfileRecipe[];
  diningReviews?: ProfileDiningReview[];
  editSlot?: ReactNode;
  look?: StudioLook;
  wall?: WallComment[];
  wallSlot?: ReactNode;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="ps-section">
      <div className="ps-section-bar">{title}</div>
      <div className="p-3 text-sm">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-2 border-b border-black/5 py-1.5 last:border-0 dark:border-white/5">
      <dt className="font-semibold opacity-80">{label}</dt>
      <dd className="whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function themeStyle(look: StudioLook): CSSProperties {
  const theme = PROFILE_THEMES[look.themeId] ?? PROFILE_THEMES.lumen;
  const v = theme.vars;
  const vars: Record<string, string> = {
    "--ps-bg": v.bg,
    "--ps-bg-dark": v.bgDark,
    "--ps-section-from": v.sectionFrom,
    "--ps-section-to": v.sectionTo,
    "--ps-section-from-dark": v.sectionFromDark,
    "--ps-section-to-dark": v.sectionToDark,
    "--ps-panel": v.panel,
    "--ps-panel-dark": v.panelDark,
    "--ps-border": v.border,
    "--ps-border-dark": v.borderDark,
    "--ps-text": v.text,
    "--ps-text-dark": v.textDark,
  };

  let background = undefined as string | undefined;
  if (look.backgroundType === "solid" && look.backgroundColor) {
    background = look.backgroundColor;
  } else if (look.backgroundType === "gradient" && look.backgroundColor) {
    background = `linear-gradient(180deg, ${look.backgroundColor}, ${v.accent})`;
  } else if (look.backgroundType === "image") {
    const url = safeImageSrc(look.backgroundUrl);
    if (url) {
      const overlay = Math.min(80, Math.max(0, look.overlayOpacity)) / 100;
      background = `linear-gradient(rgba(8,12,16,${overlay}), rgba(8,12,16,${overlay})), url("${url}") center / cover no-repeat`;
    }
  }

  return { ...vars, ...(background ? { background } : {}) } as CSSProperties;
}

export function MyspaceProfile({ data }: { data: MyspaceProfileData }) {
  const look = data.look ?? defaultStudioLook();
  const theme = PROFILE_THEMES[look.themeId] ?? PROFILE_THEMES.lumen;
  const order = parseModuleOrder(look.moduleOrder);
  const status = effectivePresence(data.presence, data.lastSeen);
  const mood = data.mood?.trim() || null;
  const about = data.bio?.trim() || null;
  const likeToMeet = data.likeToMeet?.trim() || null;
  const interests = data.interests?.trim() || null;
  const diagnosis =
    data.diagnosis && data.diagnosis !== "unspecified"
      ? data.diagnosis.replace("-", " ")
      : null;
  const cover = safeImageSrc(look.coverUrl);

  const modules: Record<ProfileModuleId, ReactNode> = {
    pic: (
      <>
        <Section title={`${data.name}'s Profile Pic`}>
          <div className="flex flex-col items-center gap-3">
            <Avatar
              name={data.name}
              src={data.avatarUrl}
              size={168}
              presence={status}
              className="rounded-2xl"
            />
            <div className="flex w-full justify-center gap-4 text-center text-xs opacity-70">
              <div>
                <p className="font-display text-base font-bold">{data.postCount}</p>
                posts
              </div>
              <div>
                <p className="font-display text-base font-bold">{data.followerCount}</p>
                friends
              </div>
              <div>
                <p className="font-display text-base font-bold">{data.followingCount}</p>
                following
              </div>
            </div>
          </div>
        </Section>
        <Section title="Contacting">
          {data.isOwn ? (
            <div className="space-y-2">{data.editSlot}</div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <MessageButton targetUserId={data.id} />
                <FollowButton targetUserId={data.id} initiallyFollowing={!!data.isFollowing} />
              </div>
              <BlockMuteButtons
                targetUserId={data.id}
                initiallyBlocked={data.blockedByMe}
                initiallyMuted={data.mutedByMe}
              />
            </div>
          )}
        </Section>
        {data.isOwn && (
          <Section title="Mood check-in">
            <MoodTracker />
          </Section>
        )}
      </>
    ),
    blurbs: (
      <>
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
        <Section title={`${data.name}'s Details`}>
          <dl>
            {data.location && (
              <div className="flex items-center gap-1.5 border-b border-black/5 py-1.5 dark:border-white/5">
                <MapPin className="h-3.5 w-3.5" />
                <span>{data.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 py-1.5">
              <Calendar className="h-3.5 w-3.5" />
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
      </>
    ),
    blog: (
      <Section title={`${data.name}'s Blog`}>
        {data.posts.length === 0 ? (
          <p className="py-6 text-center opacity-60">
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
    ),
    friends: (
      <Section title={`${data.name}'s Friend Space`}>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
            {data.name}&apos;s Top 8
          </p>
          <span className="text-xs opacity-60">
            {data.followerCount + data.followingCount} friends
          </span>
        </div>
        {data.topFriends.length === 0 ? (
          <p className="py-6 text-center opacity-60">
            {data.isOwn
              ? "Pick up to eight friends in Profile Studio — this isn’t auto-filled from follows."
              : "No Top 8 listed yet."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.topFriends.map((f, i) => (
              <Link
                key={f.id}
                href={`/app/u/${f.username}`}
                className="group flex flex-col items-center rounded-xl p-2 text-center transition hover:bg-black/5 dark:hover:bg-white/10"
              >
                <span className="mb-1 text-[10px] font-bold opacity-50">#{i + 1}</span>
                <Avatar
                  name={f.name}
                  src={f.avatarUrl}
                  size={64}
                  presence={effectivePresence(f.presence, f.lastSeen)}
                />
                <span className="mt-1.5 line-clamp-2 text-xs font-semibold group-hover:underline">
                  {f.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Section>
    ),
    recipes: (data.recipes?.length ?? 0) > 0 ? (
      <Section title={`${data.name}'s Recipes`}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {data.recipes!.map((r) => (
            <Link
              key={r.id}
              href={`/app/recipes/${r.id}`}
              className="group overflow-hidden rounded-xl border border-black/5 bg-white/40 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="aspect-[4/3] bg-black/5">
                <SafeImg
                  src={r.imageUrl}
                  alt=""
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="p-2">
                <p className="line-clamp-2 text-xs font-semibold group-hover:underline">{r.title}</p>
                <p className="mt-0.5 text-[10px] opacity-60">{r.category}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    ) : null,
    dining: (data.diningReviews?.length ?? 0) > 0 ? (
      <Section title={`${data.name}'s Dining`}>
        <div className="space-y-2">
          {data.diningReviews!.map((rev) => (
            <Link
              key={rev.id}
              href={`/app/restaurants/${rev.restaurant.id}`}
              className="flex gap-3 rounded-xl border border-black/5 bg-white/40 p-2 transition hover:bg-black/5 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/5">
                <SafeImg src={rev.restaurant.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{rev.restaurant.name}</p>
                <p className="text-xs opacity-60">
                  {rev.restaurant.city} · ★{rev.rating} · safety {rev.safetyRating}/5
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs opacity-80">{rev.content}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    ) : null,
    wall: (
      <Section title={`${data.name}'s Guestbook`}>
        {data.wallSlot}
        {(data.wall?.length ?? 0) === 0 && !data.wallSlot ? (
          <p className="py-6 text-center opacity-60">No notes on this wall yet.</p>
        ) : null}
        {(data.wall?.length ?? 0) > 0 && !data.wallSlot ? (
          <ul className="space-y-3">
            {data.wall!.map((c) => (
              <li key={c.id} className="flex gap-2 text-sm">
                <Avatar name={c.author.name} src={c.author.avatarUrl} size={32} />
                <div>
                  <Link href={`/app/u/${c.author.username}`} className="font-semibold hover:underline">
                    {c.author.name}
                  </Link>
                  <p className="whitespace-pre-wrap">{c.content}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </Section>
    ),
  };

  const side = order.filter((id) => id === "pic" || id === "blurbs");
  const main = order.filter((id) => id !== "pic" && id !== "blurbs");

  return (
    <div
      className={`ps-theme mx-auto max-w-5xl space-y-4 ${theme.glitter ? "ps-glitter" : ""}`}
      style={themeStyle(look)}
    >
      {cover && (
        <div className="relative h-36 overflow-hidden rounded-2xl sm:h-48">
          <SafeImg src={cover} alt="" className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: `rgba(8,12,16,${look.overlayOpacity / 200})` }}
          />
        </div>
      )}

      <div className="relative z-[1] flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className={`font-display text-3xl font-bold tracking-tight ${flairClass(look.nameFlair)} ${accentClass(look.nameAccent)}`}>
            {data.name}
          </h1>
          <p className="opacity-70">@{data.username}</p>
        </div>
        <p className={`rounded-xl bg-white/50 px-3 py-1.5 text-sm dark:bg-black/20 ${flairClass(look.nameFlair)}`}>
          <span className={`font-semibold ${accentClass(look.nameAccent)}`}>Mood:</span>{" "}
          {mood || (status === "online" ? "Online on Lumen" : status === "away" ? "Away" : "Offline")}
        </p>
      </div>

      <div className="relative z-[1] grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">{side.map((id) => <div key={id}>{modules[id]}</div>)}</aside>
        <div className="space-y-3">{main.map((id) => <div key={id}>{modules[id]}</div>)}</div>
      </div>
    </div>
  );
}

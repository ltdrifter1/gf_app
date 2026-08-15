import Link from "next/link";
import { ArrowRight, MessageCircle, UtensilsCrossed, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getCompanionMatch } from "@/lib/actions/onboarding";
import { Avatar } from "@/components/ui/avatar";
import { FollowButton } from "@/components/follow-button";
import { MessageButton } from "@/components/message-button";
import { safetyColor, safetyLabel } from "@/lib/utils";

export default async function OnboardingReadyPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>;
}) {
  const user = await requireUser();
  const { room: roomParam } = await searchParams;
  const match = await getCompanionMatch(user.id);
  if (!match) {
    return (
      <div className="mx-auto max-w-lg card p-6 text-center">
        <p className="text-sage-600">Couldn&apos;t load your matches.</p>
        <Link href="/app/chat" className="btn-primary mt-4 inline-flex">
          Open Messenger
        </Link>
      </div>
    );
  }

  const roomSlug = roomParam || match.roomSlug;

  return (
    <div className="mx-auto max-w-2xl space-y-5 py-2">
      <div>
        <h1 className="font-display text-3xl font-bold text-sage-900 dark:text-white">
          Your companion setup
        </h1>
        <p className="mt-1 text-sage-500">
          {match.city
            ? `Matched around ${match.city} — jump in when you're ready.`
            : "Here's a soft landing based on what you shared."}
        </p>
      </div>

      <section className="card p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-200">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
              Start in {match.room?.name ?? "General Support"}
            </h2>
            <p className="text-sm text-sage-500">
              {match.room?.description ?? "The main lounge — everyone welcome."}
            </p>
            <Link href={`/app/chat/${roomSlug}`} className="btn-primary mt-3 inline-flex">
              Open room <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-brand-600" />
          <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
            People who get it
          </h2>
        </div>
        <div className="space-y-3">
          {match.people.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <Link href={`/app/u/${p.username}`}>
                <Avatar name={p.name} src={p.avatarUrl} size={40} presence={p.presence} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/app/u/${p.username}`}
                  className="font-semibold text-sage-900 hover:underline dark:text-white"
                >
                  {p.name}
                </Link>
                <p className="truncate text-xs text-sage-500">
                  {[p.location, p.profile?.diagnosis, p.profile?.mood].filter(Boolean).join(" · ") ||
                    p.bio}
                </p>
              </div>
              <FollowButton targetUserId={p.id} initiallyFollowing />
              <MessageButton targetUserId={p.id} compact />
            </div>
          ))}
          {match.people.length === 0 && (
            <p className="text-sm text-sage-500">
              No matches yet — hop into Messenger and introduce yourself.
            </p>
          )}
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <UtensilsCrossed className="h-4 w-4 text-brand-600" />
          <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
            Safe dining{match.city ? ` in ${match.city}` : ""}
          </h2>
        </div>
        <div className="space-y-2">
          {match.restaurants.map((r) => (
            <Link
              key={r.id}
              href={`/app/restaurants/${r.id}`}
              className="flex items-center justify-between rounded-2xl bg-white/60 px-3 py-2.5 transition hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
            >
              <div>
                <p className="font-medium text-sage-900 dark:text-white">{r.name}</p>
                <p className="text-xs text-sage-500">
                  {r.cuisine} · {r.city}
                </p>
              </div>
              <span className={`text-xs font-semibold ${safetyColor(r.communityConfidence)}`}>
                {r.communityConfidence}% {safetyLabel(r.communityConfidence)}
              </span>
            </Link>
          ))}
          {match.restaurants.length === 0 && (
            <p className="text-sm text-sage-500">
              No spots yet in your city —{" "}
              <Link href="/app/restaurants" className="font-semibold text-brand-600 hover:underline">
                add the first one
              </Link>
              .
            </p>
          )}
        </div>
        <Link href="/app/restaurants" className="btn-ghost mt-3 inline-flex text-sm">
          Explore all dining <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { CommunityMap } from "@/components/community-map";
import { RsvpButton } from "@/components/rsvp-button";
import { Avatar } from "@/components/ui/avatar";
import { Users, Calendar, MapPin, ShieldCheck } from "lucide-react";

const TYPE_LABEL: Record<string, string> = { meetup: "Meetup", dinner: "Dinner", "support-circle": "Support Circle" };

export default async function CommunityMapPage() {
  const user = await requireUser();
  const [members, events] = await Promise.all([
    prisma.user.findMany({
      where: { lat: { not: null }, lng: { not: null }, profile: { showOnMap: true } },
      include: { profile: true },
    }),
    prisma.event.findMany({
      orderBy: { startsAt: "asc" },
      include: { host: true, attendees: { where: { userId: user.id }, select: { id: true } }, _count: { select: { attendees: true } } },
    }),
  ]);

  const pins = members
    .filter((m) => m.lat != null && m.lng != null)
    .map((m) => ({ id: m.id, name: m.name, lat: m.lat!, lng: m.lng!, location: m.location, avatarUrl: m.avatarUrl }));

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">Local Community</h1>
          <p className="text-sage-500 dark:text-sage-400">Find members near you, join meetups, and organize dinners.</p>
        </div>
        <span className="chip bg-white/60 text-sage-600 dark:bg-white/5 dark:text-sage-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Privacy controlled in your profile
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="card h-[480px] overflow-hidden p-1.5">
          <CommunityMap members={pins} />
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 font-display font-semibold text-sage-900 dark:text-white">
              <Users className="h-4 w-4 text-brand-600" /> {pins.length} members on the map
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {members.slice(0, 8).map((m) => (
                <div key={m.id} title={m.name}><Avatar name={m.name} src={m.avatarUrl} size={36} presence={m.presence} /></div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="flex items-center gap-2 font-display font-semibold text-sage-900 dark:text-white">
              <Calendar className="h-4 w-4 text-brand-600" /> Upcoming events
            </h2>
            <div className="mt-3 space-y-3">
              {events.map((e) => (
                <div key={e.id} className="rounded-2xl bg-white/60 dark:bg-white/5 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="chip bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">{TYPE_LABEL[e.type]}</span>
                      <p className="mt-1.5 font-semibold text-sage-900 dark:text-white">{e.title}</p>
                      <p className="flex items-center gap-1 text-xs text-sage-500"><MapPin className="h-3 w-3" /> {e.location}, {e.city}</p>
                      <p className="mt-0.5 text-xs text-sage-400">
                        {e.startsAt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {e._count.attendees} going
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-sage-600 dark:text-sage-300">{e.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-sage-400">Hosted by {e.host.name}</span>
                    <RsvpButton eventId={e.id} going={e.attendees.length > 0} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

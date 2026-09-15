import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Users, FileText, MessageCircle, UserPlus, ShieldAlert, Utensils } from "lucide-react";
import { resolveFlag, setRestaurantStatus, mergeRestaurants } from "@/lib/actions/admin";

export default async function AdminPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/app");

  const weekAgo = new Date(Date.now() - 7 * 86400_000);
  const dayAgo = new Date(Date.now() - 86400_000);

  const [dau, posts, messages, newMembers, flagged, pendingRestaurants, missReports] =
    await Promise.all([
      prisma.user.count({ where: { lastSeen: { gte: dayAgo } } }),
      prisma.post.count(),
      prisma.message.count(),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.flaggedContent.findMany({
        where: { status: "open" },
        include: { reporter: true },
        take: 20,
        orderBy: { createdAt: "desc" },
      }),
      prisma.restaurant.findMany({
        where: { status: { in: ["pending", "disputed", "hidden"] } },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { id: true, name: true, city: true, status: true, createdAt: true },
      }),
      prisma.scanMissReport.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { username: true } } },
      }),
    ]);

  const metrics = [
    { icon: Users, label: "Daily active", value: dau, accent: "from-brand-400 to-brand-600" },
    { icon: FileText, label: "Posts", value: posts, accent: "from-sage-400 to-sage-600" },
    { icon: MessageCircle, label: "Messages", value: messages, accent: "from-teal-400 to-brand-500" },
    { icon: UserPlus, label: "New (7d)", value: newMembers, accent: "from-amber-400 to-orange-500" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">Admin</h1>
        <p className="text-sage-500 dark:text-sage-400">
          Resolve flags, publish dining listings, and hide harmful content.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="card p-5">
              <div
                className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${m.accent} text-white`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-sage-900 dark:text-white">
                {m.value}
              </p>
              <p className="text-xs text-sage-500">{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="card p-5">
        <h2 className="flex items-center gap-2 font-display font-semibold text-sage-900 dark:text-white">
          <ShieldAlert className="h-4 w-4 text-rose-500" /> Flagged content
        </h2>
        {flagged.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            All clear — no open reports.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {flagged.map((f) => (
              <li
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/60 p-3 text-sm dark:bg-white/5"
              >
                <span className="text-sage-700 dark:text-sage-200">
                  {f.type}: {f.reason}{" "}
                  <span className="text-xs text-sage-400">· {f.refId.slice(0, 8)}</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  <form action={resolveFlag}>
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="action" value="hide" />
                    <button className="btn-ghost text-xs">Hide</button>
                  </form>
                  <form action={resolveFlag}>
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="action" value="unpublish" />
                    <button className="btn-ghost text-xs">Unpublish</button>
                  </form>
                  <form action={resolveFlag}>
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="action" value="disputed" />
                    <button className="btn-ghost text-xs">Dispute listing</button>
                  </form>
                  <form action={resolveFlag}>
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="action" value="dismiss" />
                    <button className="btn-ghost text-xs">Dismiss</button>
                  </form>
                </div>
                <span className="w-full text-xs text-sage-400">by {f.reporter.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-5">
        <h2 className="flex items-center gap-2 font-display font-semibold text-sage-900 dark:text-white">
          <Utensils className="h-4 w-4 text-brand-600" /> Dining queue
        </h2>
        {pendingRestaurants.length === 0 ? (
          <p className="mt-3 text-sm text-sage-500">No pending, disputed, or hidden listings.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {pendingRestaurants.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/60 p-3 text-sm dark:bg-white/5"
              >
                <div>
                  <p className="font-medium text-sage-900 dark:text-white">
                    {r.name}{" "}
                    <span className="text-xs font-normal uppercase text-sage-400">{r.status}</span>
                  </p>
                  <p className="text-xs text-sage-500">
                    {r.city} · {r.id}
                  </p>
                </div>
                <form action={setRestaurantStatus} className="flex flex-wrap gap-1">
                  <input type="hidden" name="id" value={r.id} />
                  <button className="btn-ghost text-xs" name="status" value="published">
                    Publish
                  </button>
                  <button className="btn-ghost text-xs" name="status" value="disputed">
                    Dispute
                  </button>
                  <button className="btn-ghost text-xs" name="status" value="hidden">
                    Hide
                  </button>
                  <button className="btn-ghost text-xs" name="status" value="pending">
                    Pending
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-5">
        <h2 className="font-display font-semibold text-sage-900 dark:text-white">
          Merge duplicate listings
        </h2>
        <p className="mt-1 text-sm text-sage-500">
          Visit reviews move onto the keep id. The duplicate is hidden — not deleted.
        </p>
        <form action={mergeRestaurants} className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input name="keepId" className="input" placeholder="Keep listing id" required />
          <input name="dropId" className="input" placeholder="Hide duplicate id" required />
          <button className="btn-secondary" type="submit">
            Merge reviews
          </button>
        </form>
      </div>

      {missReports.length > 0 ? (
        <div className="card p-5">
          <h2 className="font-display font-semibold text-sage-900 dark:text-white">
            Scan miss reports
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {missReports.map((m) => (
              <li key={m.id} className="rounded-xl bg-white/60 p-3 dark:bg-white/5">
                <p className="text-sage-700 dark:text-sage-200">
                  @{m.user.username}
                  {m.barcode ? ` · barcode ${m.barcode}` : ""}
                </p>
                <p className="text-xs text-sage-500">{m.note || m.rawText.slice(0, 160)}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

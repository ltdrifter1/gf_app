import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { Users, FileText, Star, UserPlus, Crown, ShieldAlert, BadgeCheck, Store, Package } from "lucide-react";

export default async function AdminPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/app");

  const weekAgo = new Date(Date.now() - 7 * 86400_000);
  const dayAgo = new Date(Date.now() - 86400_000);

  const [totalUsers, dau, posts, reviews, newMembers, premium, pros, flagged, restaurants, products, pendingPros] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { lastSeen: { gte: dayAgo } } }),
      prisma.post.count(),
      prisma.restaurantReview.count(),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.healthcareProfessional.count(),
      prisma.flaggedContent.findMany({ where: { status: "open" }, include: { reporter: true }, take: 10 }),
      prisma.restaurant.count(),
      prisma.product.count(),
      prisma.healthcareProfessional.findMany({ where: { verified: false }, include: { user: true } }),
    ]);

  const conversion = totalUsers ? Math.round((premium / totalUsers) * 100) : 0;

  const metrics = [
    { icon: Users, label: "Daily active users", value: dau, accent: "from-brand-400 to-brand-600" },
    { icon: FileText, label: "Posts created", value: posts, accent: "from-sage-400 to-sage-600" },
    { icon: Star, label: "Reviews submitted", value: reviews, accent: "from-amber-400 to-orange-500" },
    { icon: UserPlus, label: "New members (7d)", value: newMembers, accent: "from-teal-400 to-brand-500" },
    { icon: Crown, label: "Premium conversion", value: `${conversion}%`, accent: "from-warm-400 to-warm-500" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sage-500 dark:text-sage-400">Community health & moderation at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="card p-5">
              <div className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${m.accent} text-white`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-sage-900 dark:text-white">{m.value}</p>
              <p className="text-xs text-sage-500">{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-display font-semibold text-sage-900 dark:text-white">
            <ShieldAlert className="h-4 w-4 text-rose-500" /> Flagged content
          </h2>
          {flagged.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
              All clear — no open reports. 🎉
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {flagged.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded-xl bg-white/60 dark:bg-white/5 p-3 text-sm">
                  <span className="text-sage-700 dark:text-sage-200">{f.type}: {f.reason}</span>
                  <span className="text-xs text-sage-400">by {f.reporter.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-display font-semibold text-sage-900 dark:text-white">
            <BadgeCheck className="h-4 w-4 text-brand-500" /> Professional approvals
          </h2>
          {pendingPros.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-white/60 dark:bg-white/5 p-4 text-sm text-sage-500">
              No pending verifications. {pros} professionals verified.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {pendingPros.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl bg-white/60 dark:bg-white/5 p-3">
                  <Avatar name={p.user.name} src={p.user.avatarUrl} size={34} />
                  <div className="text-sm">
                    <p className="font-medium text-sage-900 dark:text-white">{p.user.name}</p>
                    <p className="text-xs text-sage-400">{p.credentials}</p>
                  </div>
                  <button className="btn-primary ml-auto px-3 py-1.5 text-xs">Approve</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white"><Store className="h-6 w-6" /></div>
          <div>
            <p className="font-display text-2xl font-bold text-sage-900 dark:text-white">{restaurants}</p>
            <p className="text-sm text-sage-500">Restaurants managed</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-400 to-brand-500 text-white"><Package className="h-6 w-6" /></div>
          <div>
            <p className="font-display text-2xl font-bold text-sage-900 dark:text-white">{products}</p>
            <p className="text-sm text-sage-500">Products in database</p>
          </div>
        </div>
      </div>
    </div>
  );
}

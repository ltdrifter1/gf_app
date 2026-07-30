import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Users, FileText, MessageCircle, UserPlus, ShieldAlert } from "lucide-react";

export default async function AdminPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/app");

  const weekAgo = new Date(Date.now() - 7 * 86400_000);
  const dayAgo = new Date(Date.now() - 86400_000);

  const [dau, posts, messages, newMembers, flagged] = await Promise.all([
    prisma.user.count({ where: { lastSeen: { gte: dayAgo } } }),
    prisma.post.count(),
    prisma.message.count(),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.flaggedContent.findMany({
      where: { status: "open" },
      include: { reporter: true },
      take: 10,
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
        <p className="text-sage-500 dark:text-sage-400">Community health at a glance.</p>
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
                className="flex items-center justify-between rounded-xl bg-white/60 p-3 text-sm dark:bg-white/5"
              >
                <span className="text-sage-700 dark:text-sage-200">
                  {f.type}: {f.reason}
                </span>
                <span className="text-xs text-sage-400">by {f.reporter.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

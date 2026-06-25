import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { KNOWLEDGE_TOPICS } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { BadgeCheck, GraduationCap, Play, Video } from "lucide-react";

export default async function ExpertsPage() {
  await requireUser();
  const [pros, articles, videos] = await Promise.all([
    prisma.healthcareProfessional.findMany({ where: { verified: true }, include: { user: true } }),
    prisma.article.findMany({ orderBy: { publishedAt: "desc" }, include: { author: true } }),
    prisma.video.findMany({ include: { author: true } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">Experts & Knowledge Center</h1>
        <p className="text-sage-500 dark:text-sage-400">Trusted guidance from verified doctors and dietitians.</p>
      </div>

      {/* Verified professionals */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-sage-900 dark:text-white">
          <GraduationCap className="h-5 w-5 text-brand-600" /> Verified professionals
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pros.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex items-center gap-3">
                <Avatar name={p.user.name} src={p.user.avatarUrl} size={48} />
                <div>
                  <p className="flex items-center gap-1 font-semibold text-sage-900 dark:text-white">
                    {p.user.name} <BadgeCheck className="h-4 w-4 text-brand-500" />
                  </p>
                  <p className="text-xs text-sage-500">{p.credentials}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-sage-600 dark:text-sage-300">{p.bio}</p>
              <span className="mt-3 inline-block chip bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">{p.specialty}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge topics */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-sage-900 dark:text-white">Knowledge Center</h2>
        <div className="flex flex-wrap gap-2">
          {KNOWLEDGE_TOPICS.map((t) => (
            <span key={t.slug} className="chip bg-white/60 text-sage-600 dark:bg-white/5 dark:text-sage-300">{t.label}</span>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Link key={a.id} href={`/app/experts/${a.id}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-glass-lg">
              <div className="h-36 overflow-hidden bg-sage-100">
                {a.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.imageUrl} alt={a.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                )}
              </div>
              <div className="p-4">
                {a.type === "webinar" && <span className="chip bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">Webinar</span>}
                <h3 className="mt-1 font-display font-semibold text-sage-900 dark:text-white">{a.title}</h3>
                <p className="mt-1 text-xs text-sage-500">by {a.author.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Videos */}
      {videos.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-sage-900 dark:text-white">
            <Video className="h-5 w-5 text-brand-600" /> Videos
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="card flex items-center gap-3 p-4 hover:shadow-glass-lg transition">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 to-brand-500 text-white">
                  <Play className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sage-900 dark:text-white">{v.title}</p>
                  <p className="text-xs text-sage-500">{v.author.name}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

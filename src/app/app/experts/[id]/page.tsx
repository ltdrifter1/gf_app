import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();
  const a = await prisma.article.findUnique({ where: { id }, include: { author: true } });
  if (!a) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/app/experts" className="btn-ghost w-fit"><ArrowLeft className="h-4 w-4" /> Knowledge Center</Link>
      <article className="card overflow-hidden">
        {a.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.imageUrl} alt={a.title} className="h-60 w-full object-cover" />
        )}
        <div className="p-6 sm:p-8">
          {a.type === "webinar" && <span className="chip bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">Webinar</span>}
          <h1 className="mt-2 font-display text-3xl font-bold text-sage-900 dark:text-white">{a.title}</h1>
          <div className="mt-4 flex items-center gap-3">
            <Avatar name={a.author.name} src={a.author.avatarUrl} size={40} />
            <div>
              <p className="flex items-center gap-1 text-sm font-semibold text-sage-900 dark:text-white">
                {a.author.name} <BadgeCheck className="h-4 w-4 text-brand-500" />
              </p>
              <p className="text-xs text-sage-400">{timeAgo(a.publishedAt)}</p>
            </div>
          </div>
          <div className="prose mt-6 max-w-none leading-relaxed text-sage-700 dark:text-sage-200">
            {a.content.split("\n").map((para, i) => (
              <p key={i} className="mb-4">{para}</p>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-amber-50 dark:bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
            This article is educational and not a substitute for personalized medical advice. Please consult your healthcare provider.
          </div>
        </div>
      </article>
    </div>
  );
}

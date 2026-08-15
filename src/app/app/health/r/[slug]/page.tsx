import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { HealthTool, hasHealthTool } from "@/components/health-tools";
import {
  MENTAL_HEALTH_CATEGORIES,
  PHYSICAL_HEALTH_CATEGORIES,
} from "@/lib/constants";

export default async function HealthResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireUser();

  const resource = await prisma.healthResource.findUnique({ where: { slug } });
  if (!resource) notFound();

  const categories =
    resource.pillar === "mental" ? MENTAL_HEALTH_CATEGORIES : PHYSICAL_HEALTH_CATEGORIES;
  const category = categories.find((c) => c.slug === resource.category);
  const backHref =
    resource.pillar === "mental" ? "/app/health?tab=mental" : "/app/health?tab=physical";
  const paragraphs = resource.body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href={backHref} className="btn-ghost w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to {resource.pillar === "mental" ? "Mental" : "Physical"}
      </Link>

      <article className="relative overflow-hidden rounded-[1.75rem] border border-white/40 bg-white/55 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1715]/80 sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_20%_0%,rgba(13,148,136,0.14),transparent_60%)]" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sage-400">
            {category && <span>{category.label}</span>}
            <span>·</span>
            <span>{resource.type}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-sage-900 dark:text-white">
            {resource.title}
          </h1>
          <p className="mt-3 text-base text-sage-600 dark:text-sage-300">{resource.content}</p>

          <div className="mt-6 space-y-4">
            {paragraphs.map((p) => (
              <p
                key={p.slice(0, 48)}
                className="whitespace-pre-wrap text-sm leading-relaxed text-sage-700 dark:text-sage-200"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </article>

      {hasHealthTool(resource.toolKey) && resource.toolKey && (
        <HealthTool toolKey={resource.toolKey} />
      )}

      <div className="flex flex-wrap gap-2">
        {resource.pillar === "mental" && (
          <Link href="/app/chat/mental-health" className="btn-secondary">
            Open Mental Health chat
          </Link>
        )}
        <Link href="/app/health?tab=track" className="btn-secondary">
          Log on Track
        </Link>
        <Link href="/app/health" className="btn-ghost">
          Journal
        </Link>
      </div>

      <p className="text-xs text-sage-400">
        Educational peer content — not medical advice. Seek professional care for diagnosis or
        treatment decisions.
      </p>
    </div>
  );
}

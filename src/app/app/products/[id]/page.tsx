import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, ScanBarcode } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Stars } from "@/components/star-rating";
import { ProductReviewForm, IngredientReportForm } from "@/components/product-forms";
import { Avatar } from "@/components/ui/avatar";
import { safetyColor, safetyLabel, timeAgo, cn } from "@/lib/utils";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();
  const p = await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" } },
      reports: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!p) notFound();
  const avg = p.reviews.length ? p.reviews.reduce((s, x) => s + x.rating, 0) / p.reviews.length : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link href="/app/products" className="btn-ghost w-fit"><ArrowLeft className="h-4 w-4" /> All products</Link>

      <div className="card grid gap-6 p-6 sm:grid-cols-[200px_1fr]">
        <div className="h-48 w-full overflow-hidden rounded-2xl bg-sage-100">
          {p.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-sage-400">{p.brand}</p>
          <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">{p.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Stars value={avg} /> <span className="text-sm text-sage-500">{avg ? avg.toFixed(1) : "New"} ({p.reviews.length})</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip bg-sage-100 text-sage-600 dark:bg-white/10 dark:text-sage-300">{p.category}</span>
            {p.certified && <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"><ShieldCheck className="h-3.5 w-3.5" /> Certified GF</span>}
            {p.barcode && <span className="chip bg-sage-100 text-sage-600 dark:bg-white/10 dark:text-sage-300"><ScanBarcode className="h-3.5 w-3.5" /> {p.barcode}</span>}
          </div>
          <div className="mt-4 rounded-2xl bg-white/60 dark:bg-white/5 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-sage-500">Safety rating</span>
              <span className={cn("font-bold", safetyColor(p.safetyRating))}>{p.safetyRating}% · {safetyLabel(p.safetyRating)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-sage-200/70 dark:bg-white/10">
              <div className={cn("h-full rounded-full", p.safetyRating >= 75 ? "bg-emerald-500" : p.safetyRating >= 50 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${p.safetyRating}%` }} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium text-sage-500">Ingredients</p>
            <p className="text-sm text-sage-700 dark:text-sage-200">{p.ingredients}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Write a review</h2>
            <div className="mt-3"><ProductReviewForm productId={p.id} /></div>
          </div>
          <div className="space-y-3">
            {p.reviews.map((rev) => (
              <div key={rev.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={rev.user.name} src={rev.user.avatarUrl} size={34} />
                  <p className="text-sm font-semibold text-sage-900 dark:text-white">{rev.user.name}</p>
                  <span className="ml-auto"><Stars value={rev.rating} /></span>
                </div>
                <p className="mt-2 text-sage-700 dark:text-sage-200">{rev.content}</p>
                <p className="mt-1 text-xs text-sage-400">{timeAgo(rev.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-display font-semibold text-sage-900 dark:text-white">Spotted a change?</h3>
            <p className="mb-3 text-sm text-sage-500">Ingredients change. Help keep this safe & current.</p>
            <IngredientReportForm productId={p.id} />
          </div>
          {p.reports.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display font-semibold text-sage-900 dark:text-white">Recent reports</h3>
              <ul className="mt-2 space-y-2 text-sm text-sage-600 dark:text-sage-300">
                {p.reports.map((r) => (
                  <li key={r.id} className="rounded-xl bg-amber-50 dark:bg-amber-500/10 p-2">{r.description}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

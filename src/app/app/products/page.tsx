import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { safetyColor, cn } from "@/lib/utils";
import { ShieldCheck, ScanBarcode } from "lucide-react";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  await requireUser();
  const products = await prisma.product.findMany({
    where: category ? { category } : undefined,
    orderBy: { safetyRating: "desc" },
    include: { _count: { select: { reviews: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">Product Database</h1>
          <p className="text-sage-500 dark:text-sage-400">Crowdsourced gluten-free products with safety ratings.</p>
        </div>
        <button className="btn-secondary" title="Barcode scanner (demo)">
          <ScanBarcode className="h-4 w-4" /> Scan barcode
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link href="/app/products" className={`chip shrink-0 border ${!category ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200" : "border-transparent bg-white/60 text-sage-600 dark:bg-white/5 dark:text-sage-300"}`}>All</Link>
        {PRODUCT_CATEGORIES.map((c) => (
          <Link key={c} href={`/app/products?category=${encodeURIComponent(c)}`} className={`chip shrink-0 border ${category === c ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200" : "border-transparent bg-white/60 text-sage-600 dark:bg-white/5 dark:text-sage-300"}`}>{c}</Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Link key={p.id} href={`/app/products/${p.id}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-glass-lg">
            <div className="flex items-center justify-center bg-white/50 dark:bg-white/5 p-4">
              <div className="h-32 w-32 overflow-hidden rounded-2xl bg-sage-100">
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-sage-400">{p.brand}</p>
                  <h3 className="font-display font-semibold text-sage-900 dark:text-white">{p.name}</h3>
                </div>
                {p.certified && <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="chip bg-sage-100 text-sage-600 dark:bg-white/10 dark:text-sage-300">{p.category}</span>
                <span className={cn("text-sm font-bold", safetyColor(p.safetyRating))}>{p.safetyRating}% safe</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

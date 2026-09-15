import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GfCostTracker } from "@/components/gf-cost-tracker";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CostsPage() {
  const user = await requireUser();
  const entries = await prisma.gfCostEntry.findMany({
    where: { userId: user.id },
    orderBy: { purchasedAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/app/health" className="btn-ghost w-fit">
        <ArrowLeft className="h-4 w-4" /> Health
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">
          Canadian GF cost tracker
        </h1>
        <p className="text-sage-500">
          Favour receipts you already have. Export a CSV for your own medical-expense records — we
          don&apos;t file taxes.
        </p>
      </div>
      <GfCostTracker
        initial={entries.map((e) => ({
          id: e.id,
          productName: e.productName,
          gfPrice: e.gfPrice,
          regularPrice: e.regularPrice,
          store: e.store,
          purchasedAt: e.purchasedAt.toISOString(),
          photoUrl: e.photoUrl,
        }))}
      />
    </div>
  );
}

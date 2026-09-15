"use client";

import { useMemo, useState, useTransition } from "react";
import { Download, Trash2 } from "lucide-react";
import { addGfCostEntry, deleteGfCostEntry, exportGfCostsCsv } from "@/lib/actions/costs";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/image-upload";
import { TaxHelpCard } from "@/components/tax-help-card";

export type CostRow = {
  id: string;
  productName: string;
  gfPrice: number;
  regularPrice: number;
  store: string | null;
  purchasedAt: string;
  photoUrl: string | null;
};

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export function GfCostTracker({ initial }: { initial: CostRow[] }) {
  const [rows, setRows] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const year = new Date().getFullYear();

  const grouped = useMemo(() => {
    const map = new Map<string, CostRow[]>();
    for (const r of rows) {
      const k = monthKey(r.purchasedAt);
      map.set(k, [...(map.get(k) ?? []), r]);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [rows]);

  const totalDiff = rows.reduce((s, r) => s + Math.max(0, r.gfPrice - r.regularPrice), 0);

  function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await addGfCostEntry(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      if (res?.entry) {
        setRows((prev) => [
          {
            id: res.entry.id,
            productName: res.entry.productName,
            gfPrice: res.entry.gfPrice,
            regularPrice: res.entry.regularPrice,
            store: res.entry.store,
            purchasedAt: res.entry.purchasedAt,
            photoUrl: res.entry.photoUrl,
          },
          ...prev,
        ]);
      }
      (document.getElementById("gf-cost-form") as HTMLFormElement | null)?.reset();
    });
  }

  function downloadCsv() {
    start(async () => {
      const res = await exportGfCostsCsv(year);
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lumen-gf-costs-${res.year}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="space-y-5">
      <div className="card space-y-3 p-5">
        <p className="text-sm text-sage-600 dark:text-sage-300">
          Track the extra you pay for gluten-free staples. The CSV is shaped like Canadian medical-expense
          documentation (date, supplier, description, amounts, differential). Eligibility still depends on
          your situation — this is not tax advice.
        </p>
        <form id="gf-cost-form" action={onSubmit} noValidate className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-sage-500">Product</label>
            <input name="productName" className="input mt-1" placeholder="GF pasta, 454 g" />
          </div>
          <div>
            <label className="text-xs font-medium text-sage-500">GF price (CAD)</label>
            <input name="gfPrice" type="number" step="0.01" min="0" className="input mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-sage-500">Regular price (CAD)</label>
            <input name="regularPrice" type="number" step="0.01" min="0" className="input mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-sage-500">Store</label>
            <input name="store" className="input mt-1" placeholder="Loblaws, Bulk Barn…" />
          </div>
          <div>
            <label className="text-xs font-medium text-sage-500">Date</label>
            <input
              name="purchasedAt"
              type="date"
              className="input mt-1"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-sage-500">Receipt photo (optional)</label>
            <ImageUpload name="photoUrl" folder="receipts" label="Upload receipt" />
          </div>
          <button type="submit" className="btn-primary sm:col-span-2" disabled={pending}>
            {pending ? "Saving…" : "Save receipt"}
          </button>
        </form>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-sage-600">
          Differential this list:{" "}
          <span className="font-semibold text-sage-900 dark:text-white">${totalDiff.toFixed(2)}</span> CAD
        </p>
        <button type="button" className="btn-secondary text-sm" onClick={downloadCsv} disabled={pending}>
          <Download className="h-4 w-4" /> Export {year} CSV
        </button>
      </div>

      {grouped.length === 0 ? (
        <p className="text-sm text-sage-500">No receipts yet. Add a staple you paid extra for.</p>
      ) : (
        grouped.map(([month, list]) => {
          const sub = list.reduce((s, r) => s + Math.max(0, r.gfPrice - r.regularPrice), 0);
          return (
            <section key={month} className="card p-5">
              <h3 className="font-display font-semibold text-sage-900 dark:text-white">
                {month} · ${sub.toFixed(2)} extra
              </h3>
              <ul className="mt-3 space-y-2">
                {list.map((r) => (
                  <li
                    key={r.id}
                    className={cn("flex items-start gap-3 rounded-xl bg-white/60 p-3 text-sm dark:bg-white/5")}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sage-900 dark:text-white">{r.productName}</p>
                      <p className="text-sage-500">
                        {r.store || "Store not listed"} · {r.purchasedAt.slice(0, 10)}
                      </p>
                      <p className="text-xs text-sage-400">
                        GF ${r.gfPrice.toFixed(2)} vs regular ${r.regularPrice.toFixed(2)} · extra $
                        {Math.max(0, r.gfPrice - r.regularPrice).toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-ghost p-1.5 text-rose-500"
                      aria-label="Delete"
                      onClick={() => {
                        start(async () => {
                          await deleteGfCostEntry(r.id);
                          setRows((prev) => prev.filter((x) => x.id !== r.id));
                        });
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      <TaxHelpCard />

      <p className="text-[11px] text-sage-400">
        CRA medical-expense rules change and depend on your situation (including whether a practitioner
        recommended a gluten-free diet). Keep receipts. The tracker does not file a return or give legal
        advice.
      </p>
    </div>
  );
}

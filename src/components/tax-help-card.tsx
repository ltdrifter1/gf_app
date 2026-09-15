import { Mail } from "lucide-react";
import { BRAND, taxesMailto } from "@/lib/brand";

/** Soft, one-beat offer after the receipt log — not a filing product. */
export function TaxHelpCard() {
  return (
    <aside className="card space-y-3 p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
          <Mail className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
            Want a human for the rest of the return?
          </h2>
          <p className="mt-1 text-sm text-sage-600 dark:text-sage-300">
            This page is a receipt log, not a tax filing. {BRAND.name} is built by a Canadian
            chartered accountant. If you’d like help with personal taxes — gluten-free extras,
            medical expenses, the whole return — send a note. No pressure.
          </p>
        </div>
      </div>
      <a href={taxesMailto()} className="btn-secondary w-fit">
        <Mail className="h-4 w-4" />
        Email about personal taxes
      </a>
    </aside>
  );
}

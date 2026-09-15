import { requireUser } from "@/lib/auth";
import { getRecentScans } from "@/lib/actions/scan";
import { LabelScanTool } from "@/components/label-scan-tool";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ScanPage() {
  await requireUser();
  const history = await getRecentScans(15);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/app/health" className="btn-ghost w-fit">
        <ArrowLeft className="h-4 w-4" /> Health
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">
          Label & menu scan
        </h1>
        <p className="text-sage-500">
          A food-hub tool — photo or paste. Heuristic gluten check, not a lab.
        </p>
      </div>
      <LabelScanTool initialHistory={history} />
    </div>
  );
}

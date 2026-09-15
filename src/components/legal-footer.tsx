import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function LegalFooter({ className = "" }: { className?: string }) {
  return (
    <p className={className}>
      <Link href="/privacy" className="hover:underline">
        Privacy
      </Link>
      <span className="mx-2 opacity-40">·</span>
      <Link href="/terms" className="hover:underline">
        Terms
      </Link>
      <span className="mx-2 opacity-40">·</span>
      {BRAND.name}
      <span className="mx-1.5 opacity-40">·</span>
      <span className="opacity-80">{BRAND.domain}</span>
    </p>
  );
}

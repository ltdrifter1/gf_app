import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo />
      <h1 className="mt-8 font-display text-3xl font-bold text-sage-900 dark:text-white">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sage-500 dark:text-sage-400">
        That link doesn&apos;t lead anywhere in Plate.
      </p>
      <Link href="/app" className="btn-primary mt-6">
        Back to Community
      </Link>
    </div>
  );
}

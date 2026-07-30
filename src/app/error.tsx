"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="card max-w-md p-8">
        <h1 className="font-display text-2xl font-bold text-sage-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mt-2 text-sage-500 dark:text-sage-400">
          Please try again. If it keeps happening, head back to your feed.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/app" className="btn-secondary">
            Go to feed
          </Link>
        </div>
      </div>
    </div>
  );
}

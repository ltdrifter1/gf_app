"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { CAREGIVER_LETTERS, CAREGIVER_SCRIPTS } from "@/lib/caregiver";

function CopyBlock({ title, body }: { title: string; body: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-semibold text-sage-900 dark:text-white">{title}</h3>
        <button
          type="button"
          className="btn-ghost px-2 py-1 text-xs"
          onClick={async () => {
            await navigator.clipboard.writeText(body);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-sage-700 dark:text-sage-200">{body}</pre>
    </div>
  );
}

export function CaregiverPack() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-sage-600 dark:text-sage-300">
        Warm scripts and letters for school, parties, and relatives who mean well. Tweak the names. This is not
        legal, medical, or 504/IEP advice — just a head start.
      </p>

      <section className="card space-y-3 p-5">
        <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
          30-second explains
        </h2>
        {CAREGIVER_SCRIPTS.map((s) => (
          <CopyBlock key={s.slug} title={s.title} body={s.body} />
        ))}
      </section>

      <section className="space-y-3">
        {CAREGIVER_LETTERS.map((l) => (
          <div key={l.slug} className="card space-y-2 p-5">
            <p className="text-xs text-sage-400">{l.blurb}</p>
            <CopyBlock title={l.title} body={l.body} />
          </div>
        ))}
      </section>

      <Link href="/app/recipes?category=Kids" className="btn-primary inline-flex">
        Kid-friendly recipes
      </Link>
      <p className="text-xs text-sage-500">
        The Kids category is highlighted here so lunchboxes don&apos;t start from a blank page.
      </p>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "../actions";
import { AuthShell, SubmitButton } from "../shell";

const DIAGNOSES = [
  { value: "celiac", label: "Celiac disease" },
  { value: "gluten-intolerance", label: "Gluten intolerance" },
  { value: "supporter", label: "Family / supporter" },
  { value: "unspecified", label: "Prefer not to say" },
];

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, { error: "" } as { error?: string });

  return (
    <AuthShell title="Join CCL" subtitle="Connect. Share. Belong. — free to join.">
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <p className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
            {state.error}
          </p>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">Name</label>
          <input name="name" required className="input" placeholder="Maya Patel" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">Email</label>
          <input name="email" type="email" required className="input" placeholder="you@example.com" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">Password</label>
          <input name="password" type="password" required className="input" placeholder="At least 6 characters" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">
            Where are you in your journey?
          </label>
          <select name="diagnosis" className="input" defaultValue="celiac">
            {DIAGNOSES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <SubmitButton>Create my account</SubmitButton>
      </form>

      <p className="mt-5 text-center text-sm text-sage-600 dark:text-sage-300">
        Already a member?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

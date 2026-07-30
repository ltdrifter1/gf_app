"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "../actions";
import { AuthShell, SubmitButton } from "../shell";

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, { error: "" } as { error?: string });

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Your community is right where you left it."
    >
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
            {state.error}
          </p>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="input"
            placeholder="••••••••"
          />
        </div>
        <SubmitButton>Sign in</SubmitButton>
      </form>

      <p className="mt-5 text-center text-sm text-sage-600 dark:text-sage-300">
        New here?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Join CCL
        </Link>
      </p>
    </AuthShell>
  );
}

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
      subtitle="Your Circle is right where you left it."
    >
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <p className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
            {state.error}
          </p>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">Email</label>
          <input name="email" type="email" required className="input" placeholder="you@example.com" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">Password</label>
          <input name="password" type="password" required className="input" placeholder="••••••••" />
        </div>
        <SubmitButton>Sign in</SubmitButton>
      </form>

      <div className="mt-5 rounded-2xl bg-brand-50/70 dark:bg-brand-500/10 p-3 text-center text-xs text-brand-700 dark:text-brand-200">
        Demo account: <span className="font-semibold">maya@circle.app</span> / <span className="font-semibold">password123</span>
      </div>

      <p className="mt-5 text-center text-sm text-sage-600 dark:text-sage-300">
        New here?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Find your Circle
        </Link>
      </p>
    </AuthShell>
  );
}

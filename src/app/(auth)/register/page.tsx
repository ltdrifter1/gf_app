"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthShell title="Join Safely" subtitle="Your gluten-free companion — free to join.">
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
            {state.error}
          </p>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">
            Name
          </label>
          <input
            name="name"
            required
            autoComplete="name"
            className="input"
            placeholder="Maya Patel"
          />
        </div>
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
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              className="input pr-11"
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
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

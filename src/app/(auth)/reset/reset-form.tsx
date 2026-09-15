"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { confirmPasswordReset } from "@/lib/actions/password";
import { AuthShell, SubmitButton } from "../shell";

export function ResetPasswordForm({ token }: { token: string }) {
  const [, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  if (!token) {
    return (
      <AuthShell title="Reset password" subtitle="This link is missing a token.">
        <p className="text-sm text-sage-600">
          Request a new link from{" "}
          <Link href="/forgot" className="font-semibold text-brand-600 hover:underline">
            forgot password
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

  if (ok) {
    return (
      <AuthShell title="Password updated" subtitle="You can sign in with your new password.">
        <Link href="/login" className="btn-primary w-full justify-center">
          Sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="This link expires in one hour.">
      <form
        className="space-y-4"
        action={(fd) => {
          fd.set("token", token);
          setError(null);
          start(async () => {
            const res = await confirmPasswordReset(fd);
            if ("error" in res && res.error) setError(res.error);
            else setOk(true);
          });
        }}
      >
        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>
        ) : null}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">
            New password
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="input"
          />
        </div>
        <SubmitButton>Update password</SubmitButton>
      </form>
    </AuthShell>
  );
}

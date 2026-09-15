"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/password";
import { AuthShell, SubmitButton } from "../shell";

export default function ForgotPasswordPage() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  return (
    <AuthShell title="Reset password" subtitle="We'll email a link if that address is on Lumen.">
      <form
        className="space-y-4"
        action={(fd) => {
          setError(null);
          setMessage(null);
          setDevLink(null);
          start(async () => {
            const res = await requestPasswordReset(fd);
            if ("error" in res && res.error) setError(res.error);
            else if ("ok" in res && res.ok) {
              setMessage(res.message);
              if ("devLink" in res && res.devLink) setDevLink(res.devLink);
            }
          });
        }}
      >
        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>
        ) : null}
        {message ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>
        ) : null}
        {devLink ? (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Email isn't configured locally. Use this link:{" "}
            <a href={devLink} className="font-semibold underline">
              Reset password
            </a>
          </p>
        ) : null}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">
            Email
          </label>
          <input name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <SubmitButton>Send reset link</SubmitButton>
      </form>
      {pending ? null : null}
      <p className="mt-5 text-center text-sm text-sage-600">
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}

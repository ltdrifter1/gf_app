"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/password";
import { AuthShell, SubmitButton } from "../shell";

export default function ForgotPasswordPage() {
  const [, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recoveryLink, setRecoveryLink] = useState<string | null>(null);

  return (
    <AuthShell
      title="Reset password"
      subtitle="We'll email a one-hour link if that address is on Lumen. If email isn't set up on this host, the link appears here instead."
    >
      <form
        className="space-y-4"
        action={(fd) => {
          setError(null);
          setMessage(null);
          setRecoveryLink(null);
          start(async () => {
            const res = await requestPasswordReset(fd);
            if ("error" in res && res.error) setError(res.error);
            else if ("ok" in res && res.ok) {
              setMessage(res.message);
              if ("recoveryLink" in res && res.recoveryLink) setRecoveryLink(res.recoveryLink);
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
        {recoveryLink ? (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            Email sending is off (add <code className="font-mono text-xs">RESEND_API_KEY</code> to
            send mail). Your one-hour link:{" "}
            <a href={recoveryLink} className="font-semibold underline">
              Choose a new password
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
      <p className="mt-5 text-center text-sm text-sage-600">
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}

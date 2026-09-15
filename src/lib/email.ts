import "server-only";
import { BRAND } from "@/lib/brand";

export function appUrl() {
  const fromEnv = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") {
    if (fromEnv && /localhost|127\.0\.0\.1/.test(fromEnv)) return fromEnv;
    return "http://localhost:3000";
  }
  return fromEnv || `https://${BRAND.domain}`;
}

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendPlainEmail(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; error: string; recoveryLink?: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || `${BRAND.name} <noreply@${BRAND.domain}>`;
  const recoveryLink = opts.text.match(/https?:\/\/\S+/)?.[0];
  if (!key) {
    if (recoveryLink) {
      console.info(`[lumen] email not configured; recovery link for ${opts.to}: ${recoveryLink}`);
    }
    return {
      ok: false,
      error: "Email isn't configured. Set RESEND_API_KEY to send mail.",
      recoveryLink,
    };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      text: opts.text,
    }),
  });
  if (!res.ok) {
    return { ok: false, error: "Couldn't send email right now.", recoveryLink };
  }
  return { ok: true };
}

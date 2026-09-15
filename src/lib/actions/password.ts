"use server";

import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { rateLimit, clientIpKey } from "@/lib/rate-limit";
import { sendPlainEmail, appUrl } from "@/lib/email";
import { BRAND } from "@/lib/brand";

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(formData: FormData) {
  const limited = await rateLimit(await clientIpKey("reset"), 5, 60 * 60 * 1000);
  if (!limited.ok) {
    return { error: `Too many reset attempts. Try again in ${limited.retryAfterSec}s.` };
  }
  const email = String(formData.get("email") || "").toLowerCase().trim();
  if (!email) return { error: "Enter your email" };

  const user = await prisma.user.findUnique({ where: { email } });
  // Always look successful
  if (!user) {
    return { ok: true as const, message: "If that email is on Lumen, a reset link is on its way." };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.passwordReset.create({
    data: { userId: user.id, tokenHash: tokenHash(token), expiresAt },
  });

  const link = `${appUrl()}/reset?token=${token}`;
  const sent = await sendPlainEmail({
    to: user.email,
    subject: `Reset your ${BRAND.name} password`,
    text: `Reset your password (expires in 1 hour):\n\n${link}\n\nIf you didn't ask for this, you can ignore it.`,
  });

  const emailed = sent.ok;
  return {
    ok: true as const,
    emailed,
    message: emailed
      ? "If that email is on Lumen, a reset link is on its way."
      : "If that email is on Lumen, use the one-time link below. This host isn't sending email yet (set RESEND_API_KEY).",
    recoveryLink: emailed ? undefined : sent.recoveryLink,
  };
}

export async function confirmPasswordReset(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  if (password.length < 6) return { error: "Password must be at least 6 characters" };
  if (!token) return { error: "Missing reset token" };

  const row = await prisma.passwordReset.findUnique({ where: { tokenHash: tokenHash(token) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return { error: "This reset link is invalid or expired." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.passwordReset.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
  ]);

  return { ok: true as const };
}

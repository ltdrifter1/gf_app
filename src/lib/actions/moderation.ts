"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function flagContent(input: { type: string; refId: string; reason: string }) {
  const user = await requireUser();
  const limited = await rateLimit(`flag:${user.id}`, 10, 60 * 60 * 1000);
  if (!limited.ok) {
    return { error: `Thanks — we've got enough flags for now. Try again in ${limited.retryAfterSec}s.` };
  }
  const type = input.type.trim().slice(0, 40) || "unknown";
  const refId = input.refId.trim().slice(0, 80);
  const reason = input.reason.trim().slice(0, 280) || "unspecified";
  if (!refId) return { error: "Nothing to flag" };

  await prisma.flaggedContent.create({
    data: { type, refId, reason, reporterId: user.id },
  });
  return { ok: true };
}

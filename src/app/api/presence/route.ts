import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClassicAutoPresence } from "@/lib/presence";
import { maybeNudgePanicBuddy } from "@/lib/checkin-nudge";

/**
 * Heartbeat: bump lastSeen. Never forces offline users online.
 * Tab hide → away (from classic online). Tab show → online (from classic away).
 * Meaningful statuses (need-check-in, dining-out, …) stick until the user changes them.
 * Manual Offline sticks until the user sets Online again.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => ({} as { hidden?: boolean }));
  const current = await prisma.user.findUnique({
    where: { id: user.id },
    select: { presence: true },
  });
  if (!current) return NextResponse.json({ ok: false }, { status: 401 });

  if (current.presence === "need-check-in") {
    await maybeNudgePanicBuddy(user.id, current.presence);
  }

  if (current.presence === "offline") {
    return NextResponse.json({ ok: true, presence: "offline" });
  }

  const data: { lastSeen: Date; presence?: string } = { lastSeen: new Date() };
  if (isClassicAutoPresence(current.presence)) {
    if (body.hidden === true && current.presence === "online") {
      data.presence = "away";
    } else if (body.hidden === false && current.presence === "away") {
      data.presence = "online";
    }
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { presence: true },
  });

  return NextResponse.json({ ok: true, presence: updated.presence });
}

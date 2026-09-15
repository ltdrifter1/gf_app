import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { webPushConfigured } from "@/lib/push";

/** Store a PushSubscription when VAPID is configured. No-op-friendly without keys. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!webPushConfigured()) {
    return NextResponse.json({
      ok: false,
      stub: true,
      message: "VAPID keys not set — browser Notification API still works in this tab.",
    });
  }

  const body = await req.json().catch(() => null);
  const endpoint = String(body?.endpoint || "");
  const p256dh = String(body?.keys?.p256dh || "");
  const auth = String(body?.keys?.auth || "");
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "invalid subscription" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId: user.id, endpoint, p256dh, auth },
    update: { userId: user.id, p256dh, auth },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const endpoint = String(body?.endpoint || "");
  if (!endpoint) return NextResponse.json({ error: "invalid subscription" }, { status: 400 });

  await prisma.pushSubscription.deleteMany({ where: { userId: user.id, endpoint } });
  return NextResponse.json({ ok: true });
}

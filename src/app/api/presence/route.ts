import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  await prisma.user.update({
    where: { id: user.id },
    data: { presence: "online", lastSeen: new Date() },
  });
  return NextResponse.json({ ok: true });
}

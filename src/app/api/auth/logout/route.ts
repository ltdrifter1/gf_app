import { NextResponse } from "next/server";
import { destroySession, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { presence: "offline", lastSeen: new Date() },
    });
  }
  await destroySession();
  return NextResponse.redirect(new URL("/login", request.url));
}

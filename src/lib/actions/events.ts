"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function toggleRsvp(eventId: string) {
  const user = await requireUser();
  const existing = await prisma.eventAttendee.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });
  if (existing) await prisma.eventAttendee.delete({ where: { id: existing.id } });
  else await prisma.eventAttendee.create({ data: { eventId, userId: user.id } });
  revalidatePath("/app/community-map");
}

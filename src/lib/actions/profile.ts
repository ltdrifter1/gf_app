"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const diagnosis = String(formData.get("diagnosis") || "unspecified").trim();
  const avatarUrl = String(formData.get("avatarUrl") || "").trim() || null;

  if (name.length < 2) return { error: "Name must be at least 2 characters" };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      bio: bio || null,
      location: location || null,
      avatarUrl,
      profile: {
        upsert: {
          create: { diagnosis },
          update: { diagnosis },
        },
      },
    },
  });

  revalidatePath("/app/profile");
  revalidatePath(`/app/u/${user.username}`);
  revalidatePath("/app");
  return { ok: true };
}

export async function setPresence(presence: "online" | "away" | "offline") {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { presence, lastSeen: new Date() },
  });
  revalidatePath("/app/profile");
  revalidatePath("/app/chat");
  return { ok: true };
}

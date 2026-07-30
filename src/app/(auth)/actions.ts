"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  diagnosis: z.string().optional(),
});

function makeUsername(name: string, email: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 12) ||
    email.split("@")[0].replace(/[^a-z0-9]+/g, "");
  return `${base}${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function registerAction(_prev: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    diagnosis: formData.get("diagnosis") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, email, password, diagnosis } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists. Try signing in." };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      username: makeUsername(name, email),
      passwordHash: await hashPassword(password),
      bio: "New to YCN 🔵",
      profile: {
        create: {
          diagnosis: diagnosis || "unspecified",
        },
      },
    },
  });
  // Auto-join community rooms
  const rooms = await prisma.chatRoom.findMany({ where: { isCommunity: true } });
  for (const room of rooms) {
    await prisma.chatRoomMember
      .create({ data: { roomId: room.id, userId: user.id } })
      .catch(() => {});
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { presence: "online", lastSeen: new Date() },
  });

  await createSession({ userId: user.id, email: user.email, role: user.role });
  redirect("/app");
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your email and password" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { presence: "online", lastSeen: new Date() },
  });

  await createSession({ userId: user.id, email: user.email, role: user.role });
  redirect("/app");
}

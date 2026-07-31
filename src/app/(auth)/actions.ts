"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { ensureLaunchCatalog } from "@/lib/bootstrap";
import { clientIpKey, rateLimit } from "@/lib/rate-limit";

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
  const limited = rateLimit(await clientIpKey("register"), 5, 60 * 60 * 1000);
  if (!limited.ok) {
    return { error: `Too many signups from this network. Try again in ${limited.retryAfterSec}s.` };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    diagnosis: formData.get("diagnosis") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, password, diagnosis } = parsed.data;
  const email = parsed.data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists. Try signing in." };
  }

  await ensureLaunchCatalog();

  let username = makeUsername(name, email);
  for (let i = 0; i < 5; i++) {
    const taken = await prisma.user.findUnique({ where: { username } });
    if (!taken) break;
    username = makeUsername(name, email);
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      username,
      passwordHash: await hashPassword(password),
      bio: "New to Nosh 🔵",
      profile: {
        create: {
          diagnosis: diagnosis || "unspecified",
        },
      },
    },
  });

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
  redirect("/app/chat/general-support");
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const limited = rateLimit(await clientIpKey("login"), 10, 15 * 60 * 1000);
  if (!limited.ok) {
    return { error: `Too many sign-in attempts. Try again in ${limited.retryAfterSec}s.` };
  }

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

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";
import { refreshRestaurantConfidence } from "@/lib/actions/reviews";

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

export async function resolveFlag(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const action = String(formData.get("action") || "dismiss");
  const flag = await prisma.flaggedContent.findUnique({ where: { id } });
  if (!flag) return;

  if (action === "hide" && flag.type === "message") {
    await prisma.message.update({ where: { id: flag.refId }, data: { hidden: true } }).catch(() => {});
  }
  if (action === "hide" && flag.type === "post") {
    await prisma.post.update({ where: { id: flag.refId }, data: { hidden: true } }).catch(() => {});
  }
  if (action === "hide" && (flag.type === "chat-room" || flag.type === "community-room")) {
    await prisma.chatRoom.update({ where: { id: flag.refId }, data: { hidden: true } }).catch(() => {});
  }
  if ((action === "unpublish" || action === "hide") && (flag.type === "restaurant" || flag.type === "listing")) {
    await prisma.restaurant
      .update({ where: { id: flag.refId }, data: { status: "hidden" } })
      .catch(() => {});
  }
  if (action === "disputed" && (flag.type === "restaurant" || flag.type === "listing")) {
    await prisma.restaurant
      .update({ where: { id: flag.refId }, data: { status: "disputed" } })
      .catch(() => {});
  }

  await prisma.flaggedContent.update({
    where: { id },
    data: {
      status: action === "dismiss" ? "dismissed" : "resolved",
      action,
      resolvedAt: new Date(),
      resolvedById: admin.id,
    },
  });

  revalidatePath("/app/admin");
  revalidatePath("/app/chat");
  revalidatePath("/app");
}

export async function setRestaurantStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!["published", "pending", "hidden", "disputed"].includes(status)) {
    return;
  }
  const r = await prisma.restaurant.update({ where: { id }, data: { status } });
  revalidatePath("/app/admin");
  revalidatePath("/app/restaurants");
  revalidatePath(`/app/restaurants/${id}`);
  if (status === "published" && r.submittedById) {
    await notifyUser({
      userId: r.submittedById,
      type: "dining",
      title: `${r.name} is listed`,
      body: "Your spot is live. Confidence still comes from visit reviews, not claims.",
      href: `/app/restaurants/${r.id}`,
    }).catch(() => {});
  }
}

/** Move visit reviews onto the keeper listing and hide the duplicate. */
export async function mergeRestaurants(formData: FormData) {
  await requireAdmin();
  const keepId = String(formData.get("keepId") || "").trim();
  const dropId = String(formData.get("dropId") || "").trim();
  if (!keepId || !dropId || keepId === dropId) return;
  const [keep, drop] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id: keepId }, select: { id: true } }),
    prisma.restaurant.findUnique({ where: { id: dropId }, select: { id: true } }),
  ]);
  if (!keep || !drop) return;

  await prisma.$transaction([
    prisma.restaurantReview.updateMany({
      where: { restaurantId: dropId },
      data: { restaurantId: keepId },
    }),
    prisma.restaurant.update({ where: { id: dropId }, data: { status: "hidden" } }),
  ]);
  await refreshRestaurantConfidence(keepId);

  revalidatePath("/app/admin");
  revalidatePath("/app/restaurants");
  revalidatePath(`/app/restaurants/${keepId}`);
  revalidatePath(`/app/restaurants/${dropId}`);
}

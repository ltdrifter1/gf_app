"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";

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
  if (action === "hide" && (flag.type === "post" || flag.type === "community-room")) {
    await prisma.post.update({ where: { id: flag.refId }, data: { hidden: true } }).catch(() => {});
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

export async function mergeRestaurantHint() {
  return {
    hint: "Duplicates: hide the worse listing after copying reviews by hand for now.",
  };
}

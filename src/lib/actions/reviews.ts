"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function addRestaurantReview(restaurantId: string, formData: FormData) {
  const user = await requireUser();
  const rating = Number(formData.get("rating") || 5);
  const safetyRating = Number(formData.get("safetyRating") || 5);
  const content = String(formData.get("content") || "").trim();
  if (!content) return { error: "Please write a short review" };

  await prisma.restaurantReview.create({
    data: { restaurantId, userId: user.id, rating, safetyRating, content },
  });

  const agg = await prisma.restaurantReview.aggregate({
    where: { restaurantId },
    _avg: { safetyRating: true },
  });
  const confidence = Math.round((agg._avg.safetyRating ?? 3) * 20);
  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { communityConfidence: confidence, crossContaminationRisk: 100 - confidence },
  });

  revalidatePath(`/app/restaurants/${restaurantId}`);
  revalidatePath("/app/restaurants");
  return { ok: true };
}

export async function rateRecipe(recipeId: string, formData: FormData) {
  const user = await requireUser();
  const rating = Number(formData.get("rating") || 5);
  const review = String(formData.get("review") || "").trim() || null;
  await prisma.recipeRating.upsert({
    where: { recipeId_userId: { recipeId, userId: user.id } },
    create: { recipeId, userId: user.id, rating, review },
    update: { rating, review },
  });
  revalidatePath(`/app/recipes/${recipeId}`);
  return { ok: true };
}

export async function toggleSaveRecipe(recipeId: string) {
  const user = await requireUser();
  const existing = await prisma.savedRecipe.findUnique({
    where: { recipeId_userId: { recipeId, userId: user.id } },
  });
  if (existing) await prisma.savedRecipe.delete({ where: { id: existing.id } });
  else await prisma.savedRecipe.create({ data: { recipeId, userId: user.id } });
  revalidatePath(`/app/recipes/${recipeId}`);
  revalidatePath("/app/recipes");
}

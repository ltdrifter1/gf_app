"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { computeRestaurantConfidence } from "@/lib/dining-confidence";

function boolField(formData: FormData, key: string): boolean | null {
  const v = formData.get(key);
  if (v === "yes" || v === "true" || v === "on" || v === "1") return true;
  if (v === "no" || v === "false" || v === "0") return false;
  return null;
}

export async function addRestaurantReview(restaurantId: string, formData: FormData) {
  const user = await requireUser();
  const rating = Number(formData.get("rating") || 5);
  const safetyRating = Number(formData.get("safetyRating") || 5);
  const content = String(formData.get("content") || "").trim();
  if (!content) return { error: "Please write a short review" };
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { error: "Pick an overall rating" };
  }
  if (!Number.isFinite(safetyRating) || safetyRating < 1 || safetyRating > 5) {
    return { error: "Pick a GF safety rating" };
  }

  const evidenceUrl = String(formData.get("evidenceUrl") || "").trim() || null;
  if (evidenceUrl && !/^https?:\/\//i.test(evidenceUrl)) {
    return { error: "Evidence photo must be an http(s) URL" };
  }

  const crossContactIncident =
    formData.get("crossContactIncident") === "on" ||
    formData.get("crossContactIncident") === "true" ||
    formData.get("crossContactIncident") === "1";

  await prisma.restaurantReview.create({
    data: {
      restaurantId,
      userId: user.id,
      rating: Math.round(rating),
      safetyRating: Math.round(safetyRating),
      content: content.slice(0, 2000),
      evidenceUrl,
      observedDedicatedKitchen: boolField(formData, "observedDedicatedKitchen"),
      observedDedicatedFryer: boolField(formData, "observedDedicatedFryer"),
      observedSeparatePrep: boolField(formData, "observedSeparatePrep"),
      observedLabeledMenu: boolField(formData, "observedLabeledMenu"),
      observedStaffUnderstood: boolField(formData, "observedStaffUnderstood"),
      crossContactIncident,
    },
  });

  await refreshRestaurantConfidence(restaurantId);

  revalidatePath(`/app/restaurants/${restaurantId}`);
  revalidatePath("/app/restaurants");
  return { ok: true };
}

export async function refreshRestaurantConfidence(restaurantId: string) {
  const reviews = await prisma.restaurantReview.findMany({
    where: { restaurantId },
    select: {
      safetyRating: true,
      crossContactIncident: true,
      createdAt: true,
      observedDedicatedKitchen: true,
      observedDedicatedFryer: true,
      observedSeparatePrep: true,
      observedLabeledMenu: true,
      observedStaffUnderstood: true,
    },
  });

  const { confidence, risk, lastReviewAt } = computeRestaurantConfidence(reviews);

  // Soft-sync feature flags from recent positive observations
  const recent = reviews
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);
  const majority = (key: keyof (typeof recent)[number]) => {
    const votes = recent.map((r) => r[key]).filter((v) => typeof v === "boolean") as boolean[];
    if (votes.length < 2) return undefined;
    const yes = votes.filter(Boolean).length;
    return yes >= Math.ceil(votes.length / 2);
  };

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      communityConfidence: confidence,
      crossContaminationRisk: risk,
      lastReviewAt,
      ...(majority("observedDedicatedKitchen") !== undefined
        ? { dedicatedKitchen: majority("observedDedicatedKitchen")! }
        : {}),
      ...(majority("observedDedicatedFryer") !== undefined
        ? { dedicatedFryer: majority("observedDedicatedFryer")! }
        : {}),
      ...(majority("observedSeparatePrep") !== undefined
        ? { separatePrepArea: majority("observedSeparatePrep")! }
        : {}),
      ...(majority("observedLabeledMenu") !== undefined
        ? { glutenFreeMenu: majority("observedLabeledMenu")! }
        : {}),
      celiacSafe: confidence >= 70,
    },
  });
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

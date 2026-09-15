"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { createNotification } from "@/lib/actions/notifications";
import { CLAIM_CONFIDENCE_CAP } from "@/lib/dining-confidence";
import { isAllowedImageUrl } from "@/lib/uploads";

const submitSchema = z.object({
  name: z.string().min(2, "Restaurant name is required").max(120),
  city: z.string().min(2, "City is required").max(80),
  address: z.string().min(3, "Address is required").max(200),
  cuisine: z.string().max(60).optional(),
  description: z.string().max(800).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  priceLevel: z.number().int().min(1).max(4).default(2),
  dedicatedKitchen: z.boolean().default(false),
  dedicatedFryer: z.boolean().default(false),
  separatePrepArea: z.boolean().default(false),
  glutenFreeMenu: z.boolean().default(false),
  certified: z.boolean().default(false),
  celiacSafe: z.boolean().default(false),
  delivery: z.boolean().default(false),
  imageUrl: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || isAllowedImageUrl(v), "Photo must be an uploaded image or allowed URL"),
});

function flag(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true" || formData.get(key) === "1";
}

export async function submitRestaurant(formData: FormData) {
  const user = await requireUser();

  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const priceLevel = Number(formData.get("priceLevel") || 2);

  const parsed = submitSchema.safeParse({
    name: String(formData.get("name") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    cuisine: String(formData.get("cuisine") || "").trim() || undefined,
    description: String(formData.get("description") || "").trim() || undefined,
    lat,
    lng,
    priceLevel,
    dedicatedKitchen: flag(formData, "dedicatedKitchen"),
    dedicatedFryer: flag(formData, "dedicatedFryer"),
    separatePrepArea: flag(formData, "separatePrepArea"),
    glutenFreeMenu: flag(formData, "glutenFreeMenu"),
    certified: flag(formData, "certified"),
    celiacSafe: flag(formData, "celiacSafe"),
    delivery: flag(formData, "delivery"),
    imageUrl: String(formData.get("imageUrl") || "").trim(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  if (!Number.isFinite(data.lat) || !Number.isFinite(data.lng)) {
    return { error: "Drop a pin or enter valid coordinates" };
  }

  // Claim-only scores stay capped until a visit review lands.
  let confidence = 40;
  if (data.dedicatedKitchen) confidence += 4;
  if (data.dedicatedFryer) confidence += 3;
  if (data.separatePrepArea) confidence += 2;
  if (data.certified) confidence += 4;
  if (data.glutenFreeMenu) confidence += 2;
  if (data.celiacSafe) confidence += 2;
  confidence = Math.min(CLAIM_CONFIDENCE_CAP, confidence);

  const imageUrl = data.imageUrl && isAllowedImageUrl(data.imageUrl) ? data.imageUrl : null;

  const restaurant = await prisma.restaurant.create({
    data: {
      name: data.name,
      city: data.city,
      address: data.address,
      cuisine: data.cuisine || null,
      description: data.description || null,
      lat: data.lat,
      lng: data.lng,
      priceLevel: data.priceLevel,
      dedicatedKitchen: data.dedicatedKitchen,
      dedicatedFryer: data.dedicatedFryer,
      separatePrepArea: data.separatePrepArea,
      glutenFreeMenu: data.glutenFreeMenu,
      certified: data.certified,
      celiacSafe: false,
      delivery: data.delivery,
      imageUrl,
      communityConfidence: confidence,
      crossContaminationRisk: 100 - confidence,
      staffTrainingLevel: data.dedicatedKitchen ? "trained" : "basic",
      status: "pending",
      submittedById: user.id,
    },
  });

  await createNotification({
    userId: user.id,
    type: "dining",
    title: "Spot submitted",
    body: `${restaurant.name} is pending review. Claims don't raise confidence past ${CLAIM_CONFIDENCE_CAP}% until visits are logged.`,
    href: `/app/restaurants/${restaurant.id}`,
  }).catch(() => {});

  revalidatePath("/app/restaurants");
  redirect(`/app/restaurants/${restaurant.id}`);
}

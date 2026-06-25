"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// Premium upgrade.
// When STRIPE_SECRET_KEY is configured this is where you'd create a Stripe
// Checkout Session and redirect. Without it, we simulate a successful upgrade
// so the premium experience is fully demonstrable in development.
export async function upgradeToPremium() {
  const user = await requireUser();
  const usingStripe = !!process.env.STRIPE_SECRET_KEY;

  await prisma.user.update({ where: { id: user.id }, data: { isPremium: true } });
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      plan: "premium",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 86400_000),
      stripeCustomerId: usingStripe ? undefined : "cus_simulated",
      stripeSubId: usingStripe ? undefined : "sub_simulated",
    },
    create: {
      userId: user.id,
      plan: "premium",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 86400_000),
      stripeCustomerId: "cus_simulated",
      stripeSubId: "sub_simulated",
    },
  });
  revalidatePath("/app/premium");
  revalidatePath("/app");
  return { ok: true, simulated: !usingStripe };
}

export async function cancelPremium() {
  const user = await requireUser();
  await prisma.user.update({ where: { id: user.id }, data: { isPremium: false } });
  await prisma.subscription.updateMany({
    where: { userId: user.id },
    data: { plan: "free", status: "canceled" },
  });
  revalidatePath("/app/premium");
  revalidatePath("/app");
  return { ok: true };
}

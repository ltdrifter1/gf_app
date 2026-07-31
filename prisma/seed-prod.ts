/**
 * Production catalog bootstrap — rooms, restaurants, recipes, health.
 * Does NOT create demo accounts or known passwords.
 *
 *   DATABASE_URL="…" npx tsx prisma/seed-prod.ts
 */
import { PrismaClient } from "@prisma/client";
import { ensureLaunchCatalog } from "./catalog";

const prisma = new PrismaClient();

async function main() {
  console.log("🟢 Bootstrapping Plate launch catalog (no demo users)…");
  await ensureLaunchCatalog(prisma);
  console.log("✅ Catalog ready: community rooms, restaurants, recipes, health.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

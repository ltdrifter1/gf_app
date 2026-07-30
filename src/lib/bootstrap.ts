import "server-only";

import { prisma } from "@/lib/prisma";
import { ensureLaunchCatalog as ensureCatalog } from "../../prisma/catalog";

let inflight: Promise<void> | null = null;
let ready = false;

/** Idempotent catalog bootstrap for cold production DBs (no demo users). */
export async function ensureLaunchCatalog() {
  if (ready) return;
  if (!inflight) {
    inflight = ensureCatalog(prisma)
      .then(() => {
        ready = true;
      })
      .catch((err) => {
        inflight = null;
        throw err;
      });
  }
  await inflight;
}

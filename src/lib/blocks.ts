import "server-only";

import { prisma } from "@/lib/prisma";

export async function blockedPairIds(userId: string) {
  const rows = await prisma.userBlock.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  const ids = new Set<string>();
  for (const r of rows) {
    ids.add(r.blockerId === userId ? r.blockedId : r.blockerId);
  }
  return ids;
}

export async function mutedIds(userId: string) {
  const rows = await prisma.userMute.findMany({
    where: { muterId: userId },
    select: { mutedId: true },
  });
  return new Set(rows.map((r) => r.mutedId));
}

export async function isBlockedEitherWay(a: string, b: string) {
  const hit = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: a, blockedId: b },
        { blockerId: b, blockedId: a },
      ],
    },
    select: { id: true },
  });
  return Boolean(hit);
}

export function excludeBlocked<T extends { id: string }>(rows: T[], blocked: Set<string>) {
  return rows.filter((r) => !blocked.has(r.id));
}

import "server-only";

import { prisma } from "@/lib/prisma";
import {
  cityFromUserLocation,
  cityTonightDescription,
  cityTonightName,
  cityTonightSlug,
} from "@/lib/city-rooms";

function tonightExpiry(from = new Date()) {
  const d = new Date(from);
  d.setUTCHours(10, 0, 0, 0);
  if (d.getTime() <= from.getTime()) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

export async function archiveExpiredCityTonightRooms() {
  const expired = await prisma.chatRoom.findMany({
    where: { kind: "city-tonight", expiresAt: { lte: new Date() } },
    select: { id: true, slug: true, name: true },
  });
  const day = new Date().toISOString().slice(0, 10);
  for (const r of expired) {
    await prisma.chatRoom.update({
      where: { id: r.id },
      data: {
        slug: `${r.slug}-${day}-${r.id.slice(-4)}`,
        kind: "city-tonight-archive",
        isCommunity: false,
        name: `${r.name} (archived)`,
      },
    });
  }
  return expired.length;
}

export async function ensureCityTonightRoom(city: string) {
  const trimmed = city.trim();
  if (!trimmed) return null;
  await archiveExpiredCityTonightRooms();
  const slug = cityTonightSlug(trimmed);
  return prisma.chatRoom.upsert({
    where: { slug },
    update: {
      name: cityTonightName(trimmed),
      description: cityTonightDescription(trimmed),
      isCommunity: true,
      kind: "city-tonight",
      city: trimmed,
    },
    create: {
      slug,
      name: cityTonightName(trimmed),
      description: cityTonightDescription(trimmed),
      isCommunity: true,
      kind: "city-tonight",
      city: trimmed,
      expiresAt: tonightExpiry(),
    },
  });
}

export async function ensureCityTonightForUser(location: string | null | undefined) {
  const city = cityFromUserLocation(location);
  if (!city) return null;
  return ensureCityTonightRoom(city);
}

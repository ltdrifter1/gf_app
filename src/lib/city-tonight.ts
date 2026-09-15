import "server-only";

import { prisma } from "@/lib/prisma";
import {
  cityFromUserLocation,
  cityTonightDescription,
  cityTonightName,
  cityTonightSlug,
} from "@/lib/city-rooms";

export async function ensureCityTonightRoom(city: string) {
  const trimmed = city.trim();
  if (!trimmed) return null;
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
    },
  });
}

export async function ensureCityTonightForUser(location: string | null | undefined) {
  const city = cityFromUserLocation(location);
  if (!city) return null;
  return ensureCityTonightRoom(city);
}

import { cityFromLocation } from "@/lib/companion";

export function slugifyCity(city: string) {
  const slug = city
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "unknown";
}

export function cityTonightSlug(city: string) {
  return `city-${slugifyCity(city)}-tonight`;
}

export function cityTonightName(city: string) {
  return `${city} · dining tonight`;
}

export function cityTonightDescription(city: string) {
  return `Who's eating out in ${city} tonight? Swap spots and morale — not medical advice. Be kind; flag anything off.`;
}

export function cityFromUserLocation(location: string | null | undefined) {
  return cityFromLocation(location);
}

export function isCityTonightSlug(slug: string) {
  return slug.startsWith("city-") && slug.endsWith("-tonight");
}

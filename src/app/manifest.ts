import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — gluten-free companion`,
    short_name: BRAND.name,
    description: BRAND.tagline,
    start_url: "/app/chat",
    display: "standalone",
    background_color: "#e8f5f3",
    theme_color: "#337bff",
    lang: "en-CA",
    icons: [
      { src: "/logo.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}

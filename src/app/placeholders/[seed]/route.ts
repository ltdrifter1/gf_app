import { NextRequest } from "next/server";
import { placeholderSvg } from "@/lib/placeholder-svg";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ seed: string }> }
) {
  const { seed } = await params;
  const w = Math.min(1600, Math.max(200, Number(request.nextUrl.searchParams.get("w")) || 800));
  const h = Math.min(1200, Math.max(120, Number(request.nextUrl.searchParams.get("h")) || 600));
  const svg = placeholderSvg(seed || "lumen", w, h);
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

/** Deterministic, food-adjacent SVG art for catalog cards. No remote CDN. */
const PALETTES = [
  ["#0d9488", "#0284c8", "#99f6e4"],
  ["#db2777", "#fb7185", "#fbcfe8"],
  ["#d97706", "#fbbf24", "#fde68a"],
  ["#65a30d", "#a3e635", "#ecfccb"],
  ["#0891b2", "#22d3ee", "#cffafe"],
  ["#7c3aed", "#a78bfa", "#ede9fe"],
  ["#c2410c", "#fb923c", "#ffedd5"],
  ["#1d4ed8", "#60a5fa", "#dbeafe"],
];

function hashSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function placeholderSvg(seed: string, w = 800, h = 600) {
  const n = hashSeed(seed || "lumen");
  const [a, b, c] = PALETTES[n % PALETTES.length];
  const label = (seed || "Lumen").replace(/[^a-zA-Z0-9 _-]/g, " ").slice(0, 22);
  const r1 = 80 + (n % 70);
  const r2 = 50 + ((n >> 3) % 60);
  const cx = 180 + ((n >> 5) % 420);
  const cy = 140 + ((n >> 7) % 280);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="${cx}" cy="${cy}" r="${r1}" fill="${c}" fill-opacity="0.35"/>
  <circle cx="${w - cx + 40}" cy="${h - cy}" r="${r2}" fill="#fff" fill-opacity="0.18"/>
  <rect x="48" y="${h - 120}" width="${Math.min(w - 96, 420)}" height="56" rx="18" fill="#0b0f0e" fill-opacity="0.28"/>
  <text x="68" y="${h - 82}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="22" font-weight="700" fill="#fff">${label}</text>
</svg>`;
}

/**
 * Heuristic gluten ingredient checker for labels / menus.
 * Not lab-grade. Favour recall on known gluten grains; flag sneaky extras as caution.
 */

export type ScanVerdict = "safe" | "caution" | "unsafe";

export type ScanHit = {
  token: string;
  severity: "unsafe" | "caution";
  reason: string;
};

export type ScanResult = {
  verdict: ScanVerdict;
  hits: ScanHit[];
  reasons: string[];
  normalized: string;
};

const UNSAFE: { pattern: RegExp; token: string; reason: string }[] = [
  { pattern: /\bwheat\b/i, token: "wheat", reason: "Wheat is gluten-containing." },
  { pattern: /\bbarley\b/i, token: "barley", reason: "Barley is gluten-containing." },
  { pattern: /\brye\b/i, token: "rye", reason: "Rye is gluten-containing." },
  { pattern: /\bmalts?\b|\bmalted\b|\bmaltose\b|\bbarley\s+malt\b/i, token: "malt", reason: "Malt is typically barley-based unless labelled gluten-free." },
  { pattern: /\btriticale\b/i, token: "triticale", reason: "Triticale is a wheat–rye hybrid." },
  { pattern: /\bspelt\b/i, token: "spelt", reason: "Spelt is a wheat variety." },
  { pattern: /\b(?:farro|emmer|einkorn|kamut|khorasan)\b/i, token: "ancient wheat", reason: "Ancient wheat varieties still contain gluten." },
  { pattern: /\bseitan\b/i, token: "seitan", reason: "Seitan is wheat gluten." },
  { pattern: /\bgraham(?:\s+flour)?\b/i, token: "graham", reason: "Graham flour is wheat." },
  { pattern: /\bsemolina\b/i, token: "semolina", reason: "Semolina is usually durum wheat." },
  { pattern: /\bdurum\b/i, token: "durum", reason: "Durum is wheat." },
  { pattern: /\bcouscous\b/i, token: "couscous", reason: "Couscous is typically wheat." },
  { pattern: /\borzo\b/i, token: "orzo", reason: "Orzo is usually wheat pasta." },
  { pattern: /\bbulgur\b/i, token: "bulgur", reason: "Bulgur is wheat." },
  { pattern: /\bfrekeh\b/i, token: "frekeh", reason: "Freekeh is roasted wheat." },
  { pattern: /\b(?:hydrolyzed|hydrolysed)\s+wheat\b/i, token: "hydrolyzed wheat", reason: "Hydrolyzed wheat protein contains gluten." },
  { pattern: /\bwheat\s+starch\b/i, token: "wheat starch", reason: "Wheat starch may still contain gluten unless Codex/GF certified." },
  { pattern: /\bbrewer'?s\s+yeast\b/i, token: "brewer's yeast", reason: "Brewer's yeast is often a barley by-product." },
  { pattern: /\b(?:soy|soya)\s+sauce\b/i, token: "soy sauce", reason: "Regular soy sauce is usually brewed with wheat." },
  { pattern: /\bteriyaki\b/i, token: "teriyaki", reason: "Teriyaki sauce is often wheat-based." },
  { pattern: /\bflour\b/i, token: "flour", reason: "Unspecified flour is often wheat unless the label says otherwise." },
];

const CAUTION: { pattern: RegExp; token: string; reason: string }[] = [
  { pattern: /\boats?\b/i, token: "oats", reason: "Oats are often cross-contacted; look for certified gluten-free oats." },
  { pattern: /\bmay contain\b/i, token: "may contain", reason: "Precautionary allergen wording — treat as caution, not a guarantee." },
  { pattern: /\b(?:manufactured|made|processed)\s+(?:on|in)\s+(?:the\s+)?(?:same|shared)\b/i, token: "shared facility", reason: "Shared equipment/facility note — risk depends on the plant." },
  { pattern: /\bmodified(?:\s+food)?\s+starch\b/i, token: "modified starch", reason: "Modified starch is usually corn in North America, but can be wheat." },
  { pattern: /\bnatural\s+flavou?rs?\b/i, token: "natural flavour", reason: "Natural flavour can hide barley malt or wheat derivatives." },
  { pattern: /\bcaramel\s+(?:colo(?:u)?r|colouring)\b/i, token: "caramel colour", reason: "Some caramel colour is malt-derived; ask the maker if unsure." },
  { pattern: /\bdextrin\b/i, token: "dextrin", reason: "Dextrin may be wheat- or corn-based." },
  { pattern: /\bmaltodextrin\b/i, token: "maltodextrin", reason: "Usually corn in Canada/US, but confirm if the source isn't listed." },
  { pattern: /\byeast\s+extract\b/i, token: "yeast extract", reason: "Yeast extract is sometimes grown on barley." },
  { pattern: /\bmsg\b|\bmonosodium\s+glutamate\b/i, token: "MSG", reason: "MSG itself is gluten-free; some seasonings around it are not." },
  { pattern: /\bseasoning\b/i, token: "seasoning", reason: "Seasoning blends can include wheat or soy sauce powder." },
  { pattern: /\bbroth\b|\bstock\b/i, token: "broth", reason: "Broth/stock sometimes uses wheat-based flavourings." },
  { pattern: /\bimitation\s+(?:crab|seafood)\b/i, token: "imitation crab", reason: "Surimi often contains wheat starch." },
  { pattern: /\bsoy\b/i, token: "soy", reason: "Soy itself is GF; watch for soy sauce in the same ingredient list." },
];

const SAFE_OVERRIDES: { pattern: RegExp; removes: string }[] = [
  { pattern: /\bgluten[-\s]?free\s+soy\s+sauce\b|\btamari\b|\bcoconut\s+aminos\b/i, removes: "soy sauce" },
  { pattern: /\bcertified\s+gluten[-\s]?free\s+oats?\b|\bgluten[-\s]?free\s+oats?\b/i, removes: "oats" },
  { pattern: /\bgluten[-\s]?free\s+flour\b|\brice\s+flour\b|\balmond\s+flour\b|\bcoconut\s+flour\b|\bchickpea\s+flour\b|\bcorn\s+flour\b|\btapioca\b|\bsorghum\b|\bbuckwheat\s+flour\b/i, removes: "flour" },
  { pattern: /\bgluten[-\s]?free\s+malt\b|\brice\s+malt\b/i, removes: "malt" },
];

function uniqueHits(hits: ScanHit[]) {
  const seen = new Set<string>();
  const out: ScanHit[] = [];
  for (const h of hits) {
    const key = `${h.severity}:${h.token}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(h);
  }
  return out;
}

export function analyzeIngredients(raw: string): ScanResult {
  const text = raw.replace(/\s+/g, " ").trim();
  const normalized = text.toLowerCase();
  if (!text) {
    return { verdict: "caution", hits: [], reasons: ["Paste or scan some ingredients first."], normalized };
  }

  const hits: ScanHit[] = [];
  for (const rule of UNSAFE) {
    if (rule.pattern.test(text)) hits.push({ token: rule.token, severity: "unsafe", reason: rule.reason });
  }
  for (const rule of CAUTION) {
    if (rule.pattern.test(text)) hits.push({ token: rule.token, severity: "caution", reason: rule.reason });
  }

  let filtered = uniqueHits(hits);
  for (const ov of SAFE_OVERRIDES) {
    if (ov.pattern.test(text)) {
      filtered = filtered.filter((h) => h.token !== ov.removes);
    }
  }

  // "gluten-free" claim does not override an explicit wheat/barley/rye hit
  const hasGfClaim = /\bgluten[-\s]?free\b/i.test(text);
  const unsafe = filtered.filter((h) => h.severity === "unsafe");
  const caution = filtered.filter((h) => h.severity === "caution");

  let verdict: ScanVerdict = "safe";
  if (unsafe.length) verdict = "unsafe";
  else if (caution.length) verdict = "caution";
  else if (!hasGfClaim && text.length < 12) verdict = "caution";

  const reasons = filtered.map((h) => h.reason);
  if (verdict === "safe") {
    reasons.push(
      hasGfClaim
        ? "No obvious gluten grains jumped out, and the text mentions gluten-free. Still not a lab test."
        : "No obvious gluten grains jumped out. Still not a lab test — when in doubt, skip it."
    );
  }

  return { verdict, hits: filtered, reasons, normalized };
}

export function verdictLabel(verdict: ScanVerdict) {
  if (verdict === "safe") return "Looks safer";
  if (verdict === "caution") return "Caution";
  return "Unsafe signals";
}

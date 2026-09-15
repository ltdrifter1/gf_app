/** Open Food Facts barcode lookup — no API key. Prefer the CA catalog, then world. */

export type OffProduct = {
  barcode: string;
  name: string;
  brands: string | null;
  ingredients: string;
  allergens: string | null;
  labels: string | null;
  imageUrl: string | null;
  countries: string | null;
};

async function fetchOff(host: string, barcode: string): Promise<OffProduct | null> {
  const url = `https://${host}/api/v2/product/${encodeURIComponent(barcode)}.json?fields=product_name,brands,ingredients_text,allergens,labels,image_url,countries`;
  const res = await fetch(url, {
    headers: { "User-Agent": "LumenCeliac/1.0 (https://safelyceliac.com)" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    status?: number;
    product?: {
      product_name?: string;
      brands?: string;
      ingredients_text?: string;
      allergens?: string;
      labels?: string;
      image_url?: string;
      countries?: string;
    };
  };
  if (json.status !== 1 || !json.product) return null;
  const p = json.product;
  const ingredients = (p.ingredients_text || "").trim();
  const name = (p.product_name || "").trim();
  if (!name && !ingredients) return null;
  return {
    barcode,
    name: name || barcode,
    brands: p.brands?.trim() || null,
    ingredients,
    allergens: p.allergens?.trim() || null,
    labels: p.labels?.trim() || null,
    imageUrl: p.image_url || null,
    countries: p.countries?.trim() || null,
  };
}

export async function lookupBarcode(barcode: string): Promise<OffProduct | null> {
  const code = barcode.replace(/\D/g, "");
  if (code.length < 8 || code.length > 14) return null;
  return (await fetchOff("ca.openfoodfacts.org", code)) ?? fetchOff("world.openfoodfacts.org", code);
}

export function offTextForScan(p: OffProduct) {
  return [p.name, p.brands, p.labels, p.allergens, p.ingredients].filter(Boolean).join("\n");
}

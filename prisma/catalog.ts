import type { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { LAUNCH_HEALTH } from "./health-catalog";

export { LAUNCH_HEALTH } from "./health-catalog";

const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const COMMUNITY_ROOMS = [
  {
    slug: "general-support",
    name: "General Support",
    description: "The living room of Safely — wins, questions, and mid-week pep talks.",
  },
  {
    slug: "newly-diagnosed",
    name: "Newly Diagnosed",
    description: "Fresh labels, weird sauces, and people who just got here too.",
  },
  {
    slug: "mental-health",
    name: "Mental Health",
    description: "Soft landings for hard days — judgment stays outside.",
  },
  {
    slug: "parents",
    name: "Parents",
    description: "Lunchbox diplomacy, school emails, and high-fives that count.",
  },
  {
    slug: "teens",
    name: "Teens",
    description: "GF life without the grown-up lecture energy.",
  },
] as const;

export const LAUNCH_RESTAURANTS = [
  {
    name: "Mariposa Kitchen",
    city: "Austin",
    address: "1200 S Congress Ave",
    lat: 30.249,
    lng: -97.749,
    cuisine: "Mexican",
    priceLevel: 2,
    dedicatedFryer: true,
    separatePrepArea: true,
    dedicatedKitchen: true,
    certified: true,
    glutenFreeMenu: true,
    celiacSafe: true,
    delivery: true,
    staffTrainingLevel: "expert",
    communityConfidence: 92,
    img: "rest-mariposa",
    desc: "100% GF kitchen with a dedicated fryer — the rare place where you can order without a TED Talk first.",
  },
  {
    name: "Hearth & Sage",
    city: "Portland",
    address: "88 NW 23rd Ave",
    lat: 45.529,
    lng: -122.698,
    cuisine: "American",
    priceLevel: 3,
    dedicatedFryer: false,
    separatePrepArea: true,
    dedicatedKitchen: false,
    certified: false,
    glutenFreeMenu: true,
    celiacSafe: true,
    delivery: false,
    staffTrainingLevel: "trained",
    communityConfidence: 78,
    img: "rest-hearth",
    desc: "Seasonal plates and a crew that actually knows what cross-contact means. Cozy, not precious.",
  },
  {
    name: "Nonna's GF Trattoria",
    city: "Brooklyn",
    address: "455 Court St",
    lat: 40.678,
    lng: -73.999,
    cuisine: "Italian",
    priceLevel: 2,
    dedicatedFryer: true,
    separatePrepArea: true,
    dedicatedKitchen: true,
    certified: true,
    glutenFreeMenu: true,
    celiacSafe: true,
    delivery: true,
    staffTrainingLevel: "expert",
    communityConfidence: 95,
    img: "rest-nonna",
    desc: "Entirely gluten-free Italian. Bring tissues for the cacio e pepe — happy tears only.",
  },
  {
    name: "Blue Lotus Thai",
    city: "San Francisco",
    address: "21 Valencia St",
    lat: 37.769,
    lng: -122.422,
    cuisine: "Thai",
    priceLevel: 2,
    dedicatedFryer: false,
    separatePrepArea: true,
    dedicatedKitchen: false,
    certified: false,
    glutenFreeMenu: true,
    celiacSafe: false,
    delivery: true,
    staffTrainingLevel: "basic",
    communityConfidence: 61,
    img: "rest-thai",
    desc: "Plenty of GF-friendly dishes if you ask about soy sauce and shared woks. Worth the careful order.",
  },
  {
    name: "Coastline Poke",
    city: "Austin",
    address: "500 W 2nd St",
    lat: 30.266,
    lng: -97.752,
    cuisine: "Hawaiian",
    priceLevel: 2,
    dedicatedFryer: false,
    separatePrepArea: true,
    dedicatedKitchen: false,
    certified: false,
    glutenFreeMenu: true,
    celiacSafe: true,
    delivery: true,
    staffTrainingLevel: "trained",
    communityConfidence: 81,
    img: "rest-poke",
    desc: "Build-a-bowl heaven with allergens marked like they mean it. Fast, bright, low drama.",
  },
  {
    name: "The Daily Grind",
    city: "Chicago",
    address: "900 W Randolph",
    lat: 41.884,
    lng: -87.651,
    cuisine: "Cafe",
    priceLevel: 1,
    dedicatedFryer: false,
    separatePrepArea: false,
    dedicatedKitchen: false,
    certified: false,
    glutenFreeMenu: false,
    celiacSafe: false,
    delivery: true,
    staffTrainingLevel: "none",
    communityConfidence: 38,
    img: "rest-cafe",
    desc: "Cute coffee, tricky kitchen. Fine for sealed drinks — skip the pastry case if you’re celiac-careful.",
  },
  {
    name: "Verdant Bowl Co.",
    city: "Austin",
    address: "2110 S Lamar Blvd",
    lat: 30.2495,
    lng: -97.769,
    cuisine: "Bowls",
    priceLevel: 2,
    dedicatedFryer: true,
    separatePrepArea: true,
    dedicatedKitchen: false,
    certified: false,
    glutenFreeMenu: true,
    celiacSafe: true,
    delivery: true,
    staffTrainingLevel: "trained",
    communityConfidence: 84,
    img: "rest-verdant",
    desc: "Colorful bowls, dedicated fryer for the crunchy bits, and a chalkboard that lists allergens without attitude.",
  },
  {
    name: "Nonna's Sister",
    city: "Brooklyn",
    address: "190 Smith St",
    lat: 40.684,
    lng: -73.992,
    cuisine: "Italian",
    priceLevel: 2,
    dedicatedFryer: true,
    separatePrepArea: true,
    dedicatedKitchen: true,
    certified: true,
    glutenFreeMenu: true,
    celiacSafe: true,
    delivery: false,
    staffTrainingLevel: "expert",
    communityConfidence: 93,
    img: "rest-nonna2",
    desc: "Same family, same 100% GF pasta energy — slightly smaller room, equally excellent garlic bread.",
  },
  {
    name: "Cascade Bakery",
    city: "Portland",
    address: "4128 SE Hawthorne Blvd",
    lat: 45.512,
    lng: -122.62,
    cuisine: "Bakery",
    priceLevel: 2,
    dedicatedFryer: false,
    separatePrepArea: true,
    dedicatedKitchen: true,
    certified: true,
    glutenFreeMenu: true,
    celiacSafe: true,
    delivery: true,
    staffTrainingLevel: "expert",
    communityConfidence: 90,
    img: "rest-cascade",
    desc: "Dedicated GF bakery where croissants flake like they got the memo. Worth the line.",
  },
  {
    name: "Mission Tortilla Lab",
    city: "San Francisco",
    address: "2889 Mission St",
    lat: 37.752,
    lng: -122.418,
    cuisine: "Mexican",
    priceLevel: 1,
    dedicatedFryer: false,
    separatePrepArea: true,
    dedicatedKitchen: false,
    certified: false,
    glutenFreeMenu: true,
    celiacSafe: true,
    delivery: true,
    staffTrainingLevel: "trained",
    communityConfidence: 76,
    img: "rest-mission",
    desc: "House-made corn tortillas and staff who will change gloves mid-sentence if you ask. Neighborhood gem.",
  },
  {
    name: "Lakefront Grill",
    city: "Chicago",
    address: "201 E Grand Ave",
    lat: 41.892,
    lng: -87.622,
    cuisine: "American",
    priceLevel: 3,
    dedicatedFryer: true,
    separatePrepArea: true,
    dedicatedKitchen: false,
    certified: false,
    glutenFreeMenu: true,
    celiacSafe: true,
    delivery: false,
    staffTrainingLevel: "trained",
    communityConfidence: 79,
    img: "rest-lake",
    desc: "Downtown steakhouse energy with a real allergen protocol and a GF bun that doesn’t taste like cardboard.",
  },
] as const;

export const LAUNCH_RECIPES = [
  {
    title: "Banana Oat Pancakes (No Fancy Flour Required)",
    category: "Quick Meals",
    desc: "Weekend energy on a Tuesday. Blender, pan, maple — done before the coffee cools.",
    prep: 5,
    cook: 10,
    servings: 2,
    cal: 320,
    protein: 11,
    carbs: 52,
    fat: 7,
    img: "rec-pancakes",
    ingredients: [
      "2 ripe bananas",
      "2 eggs",
      "1 cup certified GF oats",
      "1 tsp baking powder",
      "Pinch of cinnamon",
    ],
    steps: [
      "Blend everything until mostly smooth (a few oat flecks are charming).",
      "Warm a non-stick pan over medium — not screaming hot.",
      "Pour small rounds; flip when bubbles look confident, about 2 min a side.",
      "Stack with berries and maple. Pretend you planned brunch.",
    ],
  },
  {
    title: "Sandwich Bread That Doesn't Crumble Mid-Bite",
    category: "Baking",
    desc: "Soft, sliceable, toast-friendly. The loaf that makes school lunches feel normal again.",
    prep: 20,
    cook: 50,
    servings: 10,
    cal: 180,
    protein: 4,
    carbs: 30,
    fat: 5,
    img: "rec-bread",
    ingredients: [
      "3 cups GF flour blend",
      "1 packet yeast",
      "2 tbsp psyllium husk",
      "1.5 cups warm water",
      "2 tbsp olive oil",
    ],
    steps: [
      "Mix dry, then wet — batter will look sticky, that’s the deal.",
      "Scoop into a greased loaf pan and let it rise 45 min.",
      "Bake at 375°F for about 50 min until the top sounds hollow.",
      "Cool completely before slicing (patience = cleaner sandwiches).",
    ],
  },
  {
    title: "Crispy Chicken Tenders Kids Actually Finish",
    category: "Kids",
    desc: "Oven-crispy, dunkable, and suspiciously popular with adults who “just want one.”",
    prep: 15,
    cook: 18,
    servings: 4,
    cal: 410,
    protein: 32,
    carbs: 22,
    fat: 19,
    img: "rec-tenders",
    ingredients: [
      "1 lb chicken tenders",
      "1 cup GF breadcrumbs",
      "2 eggs",
      "Paprika & garlic powder",
      "Olive oil spray",
    ],
    steps: [
      "Egg wash station + seasoned crumb station — classic assembly line.",
      "Coat tenders, give them a light oil mist.",
      "Bake at 425°F for 18 min, flipping once for even crunch.",
      "Serve with a GF dip and zero negotiations required.",
    ],
  },
  {
    title: "Weeknight Veggie Pad Thai",
    category: "Vegan",
    desc: "Tangy, crunchy, ready before delivery would even leave the restaurant.",
    prep: 10,
    cook: 10,
    servings: 3,
    cal: 390,
    protein: 12,
    carbs: 60,
    fat: 10,
    img: "rec-padthai",
    ingredients: [
      "8 oz rice noodles",
      "Tamarind paste",
      "Tamari (GF)",
      "Tofu",
      "Bean sprouts & peanuts",
    ],
    steps: [
      "Soak noodles in hot water until bendy, not mushy.",
      "Stir-fry tofu and veg until they smell like a good decision.",
      "Toss in sauce and noodles — work fast, keep it glossy.",
      "Finish with peanuts, lime, and whatever herbs you have left.",
    ],
  },
  {
    title: "Big Pot Lentil Soup (Freezer Hero)",
    category: "Budget",
    desc: "Cheap, cozy, and future-you will thank present-you on a tired Thursday.",
    prep: 10,
    cook: 30,
    servings: 6,
    cal: 260,
    protein: 15,
    carbs: 38,
    fat: 4,
    img: "rec-soup",
    ingredients: [
      "2 cups red lentils",
      "1 onion",
      "2 carrots",
      "GF veg stock",
      "Cumin & smoked paprika",
    ],
    steps: [
      "Sauté onion and carrot until soft and sweet.",
      "Add lentils, spices, and stock; bring to a friendly simmer.",
      "Cook about 30 min until lentils melt into the broth.",
      "Blend half if you want creaminess without cream.",
    ],
  },
  {
    title: "Quinoa Bowl That Meal-Preps Nicely",
    category: "High Protein",
    desc: "Chickpeas, greens, tahini — pack four lunches and feel briefly unstoppable.",
    prep: 15,
    cook: 20,
    servings: 4,
    cal: 480,
    protein: 28,
    carbs: 45,
    fat: 18,
    img: "rec-quinoa",
    ingredients: [
      "1 cup quinoa",
      "1 can chickpeas",
      "2 cups spinach",
      "1 avocado",
      "Tahini-lemon dressing",
    ],
    steps: [
      "Cook quinoa like the package says (you’ve got this).",
      "Roast chickpeas at 400°F for 20 min for crunch.",
      "Build bowls with greens, quinoa, chickpeas, avocado.",
      "Drizzle dressing; keep avocado separate if packing ahead.",
    ],
  },
] as const;

const CATALOG_EMAIL = "catalog@safely.internal";
const CATALOG_USERNAME = "safely";

/** Non-loginable catalog author for seed recipes (random password, never printed). */
async function ensureCatalogAuthor(prisma: PrismaClient) {
  const existing = await prisma.user.findUnique({ where: { email: CATALOG_EMAIL } });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(randomBytes(48).toString("hex"), 10);
  return prisma.user.create({
    data: {
      email: CATALOG_EMAIL,
      username: CATALOG_USERNAME,
      name: "Safely",
      role: "USER",
      bio: "Recipes from the Safely kitchen — tested by hungry friends, not robots.",
      passwordHash,
      presence: "offline",
      profile: { create: { diagnosis: "supporter" } },
    },
  });
}

export async function ensureCommunityRooms(prisma: PrismaClient) {
  for (const r of COMMUNITY_ROOMS) {
    await prisma.chatRoom.upsert({
      where: { slug: r.slug },
      update: { name: r.name, description: r.description, isCommunity: true },
      create: { ...r, isCommunity: true },
    });
  }
}

export async function ensureHealthResources(prisma: PrismaClient) {
  // Replace legacy tip stubs with richer slug-based catalog entries.
  const existing = await prisma.healthResource.findMany({ select: { id: true, slug: true } });
  const known = new Set<string>(LAUNCH_HEALTH.map((r) => r.slug));
  const stale = existing.filter((r) => !r.slug || !known.has(r.slug));
  if (stale.length) {
    await prisma.healthResource.deleteMany({ where: { id: { in: stale.map((r) => r.id) } } });
  }

  for (const r of LAUNCH_HEALTH) {
    await prisma.healthResource.upsert({
      where: { slug: r.slug },
      update: {
        title: r.title,
        pillar: r.pillar,
        category: r.category,
        type: r.type,
        content: r.content,
        body: r.body,
        toolKey: r.toolKey,
      },
      create: {
        slug: r.slug,
        title: r.title,
        pillar: r.pillar,
        category: r.category,
        type: r.type,
        content: r.content,
        body: r.body,
        toolKey: r.toolKey,
      },
    });
  }
}

export async function ensureRestaurants(prisma: PrismaClient) {
  for (const r of LAUNCH_RESTAURANTS) {
    const existing = await prisma.restaurant.findFirst({
      where: { name: r.name, city: r.city },
    });
    if (existing) {
      await prisma.restaurant.update({
        where: { id: existing.id },
        data: {
          address: r.address,
          lat: r.lat,
          lng: r.lng,
          cuisine: r.cuisine,
          priceLevel: r.priceLevel,
          dedicatedFryer: r.dedicatedFryer,
          separatePrepArea: r.separatePrepArea,
          dedicatedKitchen: r.dedicatedKitchen,
          certified: r.certified,
          glutenFreeMenu: r.glutenFreeMenu,
          celiacSafe: r.celiacSafe,
          delivery: r.delivery,
          staffTrainingLevel: r.staffTrainingLevel,
          // Don't overwrite live community scores if reviews exist
          ...(existing.lastReviewAt
            ? {}
            : {
                communityConfidence: r.communityConfidence,
                crossContaminationRisk: 100 - r.communityConfidence,
              }),
          imageUrl: existing.imageUrl || img(r.img),
          description: r.desc,
          status: "published",
        },
      });
      continue;
    }
    await prisma.restaurant.create({
      data: {
        name: r.name,
        city: r.city,
        address: r.address,
        lat: r.lat,
        lng: r.lng,
        cuisine: r.cuisine,
        priceLevel: r.priceLevel,
        dedicatedFryer: r.dedicatedFryer,
        separatePrepArea: r.separatePrepArea,
        dedicatedKitchen: r.dedicatedKitchen,
        certified: r.certified,
        glutenFreeMenu: r.glutenFreeMenu,
        celiacSafe: r.celiacSafe,
        delivery: r.delivery,
        staffTrainingLevel: r.staffTrainingLevel,
        communityConfidence: r.communityConfidence,
        crossContaminationRisk: 100 - r.communityConfidence,
        imageUrl: img(r.img),
        description: r.desc,
        status: "published",
      },
    });
  }
}

export async function ensureRecipes(prisma: PrismaClient) {
  if ((await prisma.recipe.count()) > 0) return;
  const author = await ensureCatalogAuthor(prisma);
  for (const r of LAUNCH_RECIPES) {
    await prisma.recipe.create({
      data: {
        authorId: author.id,
        title: r.title,
        description: r.desc,
        category: r.category,
        prepTime: r.prep,
        cookTime: r.cook,
        servings: r.servings,
        calories: r.cal,
        protein: r.protein,
        carbs: r.carbs,
        fat: r.fat,
        imageUrl: img(r.img),
        ingredients: [...r.ingredients],
        steps: [...r.steps],
      },
    });
  }
}

/**
 * Safe production bootstrap: rooms + dining + recipes + health.
 * Never creates demo logins or known passwords.
 */
export async function ensureLaunchCatalog(prisma: PrismaClient) {
  await ensureCommunityRooms(prisma);
  await ensureHealthResources(prisma);
  await ensureRestaurants(prisma);
  await ensureRecipes(prisma);
}

import type { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const COMMUNITY_ROOMS = [
  {
    slug: "general-support",
    name: "General Support",
    description: "The main lounge — everyone welcome.",
  },
  {
    slug: "newly-diagnosed",
    name: "Newly Diagnosed",
    description: "Just starting out? We've got you.",
  },
  {
    slug: "mental-health",
    name: "Mental Health",
    description: "A gentle space to talk feelings.",
  },
  {
    slug: "parents",
    name: "Parents",
    description: "Raising celiac kids together.",
  },
  {
    slug: "teens",
    name: "Teens",
    description: "For younger members navigating GF life.",
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
    desc: "100% gluten-free kitchen with a dedicated fryer. A celiac safe haven.",
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
    desc: "Farm-to-table with a thoughtful GF menu and trained staff.",
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
    desc: "Entirely gluten-free Italian. The pasta will make you cry.",
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
    desc: "Lots of GF options; ask about soy sauce and shared woks.",
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
    desc: "Naturally GF-friendly bowls with clearly marked allergens.",
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
    desc: "Limited GF; cross-contamination risk is real here.",
  },
] as const;

export const LAUNCH_RECIPES = [
  {
    title: "5-Minute Banana Oat Pancakes",
    category: "Quick Meals",
    desc: "Fluffy, naturally gluten-free pancakes with just a few ingredients.",
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
      "Blend all ingredients until smooth.",
      "Heat a non-stick pan over medium.",
      "Pour small rounds and cook 2 min per side.",
      "Serve with berries and maple syrup.",
    ],
  },
  {
    title: "No-Knead GF Sandwich Bread",
    category: "Baking",
    desc: "Soft, sliceable bread that actually tastes like bread.",
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
      "Mix dry, then wet ingredients.",
      "Let rise 45 min in a loaf pan.",
      "Bake at 375°F for 50 min.",
      "Cool fully before slicing.",
    ],
  },
  {
    title: "Kid-Friendly GF Chicken Tenders",
    category: "Kids",
    desc: "Crispy tenders the whole family will fight over.",
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
      "Set up egg and breadcrumb stations.",
      "Coat tenders, then spray with oil.",
      "Bake at 425°F for 18 min, flipping once.",
      "Serve with GF dipping sauce.",
    ],
  },
  {
    title: "15-Minute Veggie Pad Thai",
    category: "Vegan",
    desc: "Rice noodles, crunchy veg, and a tangy tamarind sauce.",
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
      "Soak noodles in hot water.",
      "Stir-fry tofu and veg.",
      "Add sauce and noodles, toss.",
      "Top with peanuts and lime.",
    ],
  },
  {
    title: "Budget GF Lentil Soup",
    category: "Budget",
    desc: "Hearty, cheap, and freezer-friendly.",
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
      "Sauté onion and carrot.",
      "Add lentils, spices, and stock.",
      "Simmer 30 min.",
      "Blend half for creaminess.",
    ],
  },
  {
    title: "High-Protein Quinoa Power Bowl",
    category: "High Protein",
    desc: "A satisfying, balanced bowl that meal-preps beautifully.",
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
      "Cook quinoa per package.",
      "Roast chickpeas at 400°F for 20 min.",
      "Assemble bowls with greens and avocado.",
      "Drizzle dressing and serve.",
    ],
  },
] as const;

export const LAUNCH_HEALTH = [
  {
    title: "Calming the Eating-Out Spiral",
    pillar: "mental",
    category: "eating-out",
    type: "exercise",
    content:
      "A 4-step grounding exercise for when restaurant anxiety hits: breathe, plan, ask, and self-compassion.",
  },
  {
    title: "When Diagnosis Feels Like Grief",
    pillar: "mental",
    category: "newly-diagnosed",
    type: "article",
    content:
      "Mourning your old relationship with food is normal. Naming the grief is the first step to moving through it.",
  },
  {
    title: "Beating Social Isolation",
    pillar: "mental",
    category: "isolation",
    type: "article",
    content:
      "Practical scripts for navigating shared meals, plus how to find your people in Messenger.",
  },
  {
    title: "Anxiety Toolkit for Celiac Life",
    pillar: "mental",
    category: "anxiety",
    type: "exercise",
    content:
      "Box breathing, worry windows, and a 'safe foods' anchor list to reduce daily anxiety.",
  },
  {
    title: "Low Mood & Chronic Illness",
    pillar: "mental",
    category: "depression",
    type: "article",
    content:
      "What to look for in support, and when to reach out to a clinician who understands chronic illness.",
  },
  {
    title: "Gut Healing Basics After Diagnosis",
    pillar: "physical",
    category: "gut",
    type: "article",
    content:
      "The small intestine needs time. Focus on nutrient-dense GF meals, hydration, and following your care team's timeline for follow-up.",
  },
  {
    title: "Common Nutrient Gaps",
    pillar: "physical",
    category: "nutrition",
    type: "tip",
    content:
      "Iron, B12, vitamin D, calcium, and folate are commonly low. Ask about labs — don't self-supplement blindly.",
  },
  {
    title: "What To Do After Accidental Glutening",
    pillar: "physical",
    category: "recovery",
    type: "tip",
    content:
      "Rest, hydrate, stick to known-safe foods, and track symptoms. Most flares ease in a few days — contact your doctor if severe.",
  },
  {
    title: "Fighting the Fatigue",
    pillar: "physical",
    category: "energy",
    type: "article",
    content:
      "Fatigue can linger while healing. Prioritize sleep, protein at meals, and gentle movement when you can.",
  },
  {
    title: "Labs Worth Asking About",
    pillar: "physical",
    category: "labs",
    type: "tip",
    content:
      "tTG-IgA (and total IgA), CBC, ferritin, vitamin D, B12, and bone density when indicated. Bring a list to your next visit.",
  },
] as const;

const CATALOG_EMAIL = "catalog@plate.internal";
const CATALOG_USERNAME = "plate";

/** Non-loginable catalog author for seed recipes (random password, never printed). */
async function ensureCatalogAuthor(prisma: PrismaClient) {
  const existing = await prisma.user.findUnique({ where: { email: CATALOG_EMAIL } });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(randomBytes(48).toString("hex"), 10);
  return prisma.user.create({
    data: {
      email: CATALOG_EMAIL,
      username: CATALOG_USERNAME,
      name: "Plate",
      role: "USER",
      bio: "Official Plate recipe catalog",
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
  if ((await prisma.healthResource.count()) > 0) return;
  for (const r of LAUNCH_HEALTH) {
    await prisma.healthResource.create({ data: { ...r } });
  }
}

export async function ensureRestaurants(prisma: PrismaClient) {
  if ((await prisma.restaurant.count()) > 0) return;
  for (const r of LAUNCH_RESTAURANTS) {
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

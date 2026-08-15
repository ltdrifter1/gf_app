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
    desc: "Clearly marked allergens and a dedicated fryer for GF crunch.",
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
    desc: "Sister kitchen to Nonna's — 100% GF pasta and pizza.",
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
    desc: "Dedicated GF bakery — croissants that don't crumble under pressure.",
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
    desc: "Corn tortillas made in-house; staff will change gloves on request.",
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
    desc: "Downtown grill with a serious allergen protocol and GF bun option.",
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
    slug: "eating-out-spiral",
    title: "Calming the Eating-Out Spiral",
    pillar: "mental",
    category: "eating-out",
    type: "exercise",
    toolKey: "eating-out-spiral",
    content:
      "A 4-step grounding exercise for when restaurant anxiety hits: breathe, plan, ask, and self-compassion.",
    body: `Restaurant anxiety is common with celiac — your nervous system is trying to keep you safe.

Use this when you're spinning before or during a meal out:

1. Breathe — four counts in, four out, three rounds.
2. Plan — pick one known-safer spot or one dish you can verify.
3. Ask — short script: "I have celiac. Can this be prepared without gluten cross-contact?"
4. Soften — remind yourself: one careful meal is enough; you can leave if it doesn't feel right.

If panic keeps rising, step outside, message a friend, or open the Mental Health room in Messenger.`,
  },
  {
    slug: "diagnosis-grief",
    title: "When Diagnosis Feels Like Grief",
    pillar: "mental",
    category: "newly-diagnosed",
    type: "article",
    toolKey: null,
    content:
      "Mourning your old relationship with food is normal. Naming the grief is the first step to moving through it.",
    body: `A celiac diagnosis often brings grief — for foods, spontaneity, travel ease, or family traditions.

Common waves: anger at "just one bite," sadness at missing shared plates, relief mixed with exhaustion.

What helps many people:
- Name what you miss without judging yourself for missing it.
- Keep one ritual that still works (a tea, a walk, a favorite GF bakery).
- Talk with people who live this — Community Support posts or Messenger rooms.
- Give healing time a calendar: gut repair is measured in months, not weekends.

Grief doesn't mean you're failing the diet. It means the change is real.`,
  },
  {
    slug: "social-isolation",
    title: "Beating Social Isolation",
    pillar: "mental",
    category: "isolation",
    type: "article",
    toolKey: null,
    content:
      "Practical scripts for navigating shared meals, plus how to find your people in Messenger.",
    body: `Isolation sneaks in when every invite becomes a logistics problem.

Scripts that lower the temperature:
- "I'd love to come — can we pick a place with a dedicated GF option, or I'll eat first and join for dessert/tea?"
- "I'm bringing a dish I know is safe so I can relax and hang with everyone."
- "Rain check on dinner, but I'm free for a walk / coffee with a sealed drink."

On Safely: open Messenger community rooms, follow people who get it, and post in Support when you need a reality check — not alone-time disguised as strength.`,
  },
  {
    slug: "anxiety-toolkit",
    title: "Anxiety Toolkit for Celiac Life",
    pillar: "mental",
    category: "anxiety",
    type: "exercise",
    toolKey: "anxiety-toolkit",
    content:
      "Box breathing, worry windows, and a 'safe foods' anchor list to reduce daily anxiety.",
    body: `Daily vigilance is exhausting. Use small tools instead of white-knuckling all day.

Box breathing: inhale 4 · hold 4 · exhale 4 · hold 4. Repeat 4 cycles.

Worry window: pick a 10-minute slot to list food fears, then park them until then.

Safe-foods anchor: write 5 meals you trust at home. When anxiety spikes, glance at the list — proof that safety exists.

Pair with a mood check-in on the Track tab so patterns aren't only in your head.`,
  },
  {
    slug: "low-mood-chronic",
    title: "Low Mood & Chronic Illness",
    pillar: "mental",
    category: "depression",
    type: "article",
    toolKey: null,
    content:
      "What to look for in support, and when to reach out to a clinician who understands chronic illness.",
    body: `Living with a chronic condition can flatten mood — especially after repeated glutening, social friction, or slow healing.

Watch for: sleep changes, losing interest in things you usually enjoy, hopelessness about food forever, withdrawing from people who help.

This space is peer support, not therapy. If low mood lasts most days for two weeks or more, or you have thoughts of harming yourself, contact a clinician or local crisis line.

In the US, call or text 988. You're allowed to need more than an app.`,
  },
  {
    slug: "gut-healing-basics",
    title: "Gut Healing Basics After Diagnosis",
    pillar: "physical",
    category: "gut",
    type: "article",
    toolKey: null,
    content:
      "The small intestine needs time. Focus on nutrient-dense GF meals, hydration, and following your care team's timeline for follow-up.",
    body: `Strict gluten-free eating is the treatment. Healing the lining still takes time — often months.

Practical basics:
- Stay strictly GF; cross-contact counts.
- Favor protein, iron-rich foods, and easy-to-digest meals while symptoms settle.
- Hydrate; rest more than you think you "should."
- Follow your GI's plan for repeat serology / biopsy timing.

Track flares on the Track tab so you can show your care team a clearer picture than memory alone.`,
  },
  {
    slug: "nutrient-gaps",
    title: "Common Nutrient Gaps",
    pillar: "physical",
    category: "nutrition",
    type: "tip",
    toolKey: null,
    content:
      "Iron, B12, vitamin D, calcium, and folate are commonly low. Ask about labs — don't self-supplement blindly.",
    body: `Malabsorption and a limited diet can leave gaps. Common ones: iron, B12, vitamin D, calcium, folate, sometimes zinc.

Don't megadose based on internet lists — some supplements interact or aren't absorbed well.

Ask your clinician which labs to run and whether a dietitian familiar with celiac can review your week of eating. Food-first where possible; targeted supplements when labs say so.`,
  },
  {
    slug: "after-glutening",
    title: "What To Do After Accidental Glutening",
    pillar: "physical",
    category: "recovery",
    type: "tip",
    toolKey: "glutening-checklist",
    content:
      "Rest, hydrate, stick to known-safe foods, and track symptoms. Most flares ease in a few days — contact your doctor if severe.",
    body: `Accidents happen even to careful people. A simple recovery checklist beats spiraling.

Immediate: stop exposure, hydrate, rest, stick to known-safe simple foods.
Next 48–72h: log severity and symptoms on Track; sleep extra; skip tough workouts if depleted.
Call your doctor for severe pain, persistent vomiting, dehydration, blood in stool, or symptoms that don't ease.

Shame doesn't heal the gut — rest and documentation do.`,
  },
  {
    slug: "fighting-fatigue",
    title: "Fighting the Fatigue",
    pillar: "physical",
    category: "energy",
    type: "article",
    toolKey: null,
    content:
      "Fatigue can linger while healing. Prioritize sleep, protein at meals, and gentle movement when you can.",
    body: `Fatigue after diagnosis or glutening is common while iron stores and the intestine catch up.

Levers that often help: consistent sleep, protein at each meal, short daylight walks, and treating "push through" as optional.

If fatigue is crushing or paired with dizziness, ask about anemia and vitamin D. Bring your Track log — patterns help clinicians take you seriously.`,
  },
  {
    slug: "labs-checklist",
    title: "Labs Worth Asking About",
    pillar: "physical",
    category: "labs",
    type: "tip",
    toolKey: "labs-checklist",
    content:
      "tTG-IgA (and total IgA), CBC, ferritin, vitamin D, B12, and bone density when indicated. Bring a list to your next visit.",
    body: `Every care plan is individual — this is a conversation starter, not a prescription.

Often discussed: tTG-IgA (+ total IgA), CBC, ferritin, vitamin D, B12, folate; bone density when risk factors apply.

Use the interactive checklist, then bring what you checked to your appointment. Educational only — your clinician decides what's appropriate.`,
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
      bio: "Official Safely recipe catalog",
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

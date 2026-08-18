import type { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

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

export const LAUNCH_HEALTH = [
  {
    slug: "eating-out-spiral",
    title: "When Restaurant Anxiety Spins Out",
    pillar: "mental",
    category: "eating-out",
    type: "exercise",
    toolKey: "eating-out-spiral",
    content:
      "A friendly 4-step reset for the pre-menu freakout — breathe, pick one plan, ask clearly, be kind to yourself.",
    body: `If your brain starts writing disaster novels before you even sit down — hi, you’re among friends.

Try this short loop:

1. Breathe — four in, four out, three rounds. Boring on purpose.
2. Plan — one known-safer spot or one dish you can actually verify.
3. Ask — short and clear: “I have celiac. Can this be made without gluten cross-contact?”
4. Soften — one careful meal is enough. Leaving is allowed. You’re not high-maintenance; you’re informed.

Still buzzing? Step outside, text someone who gets it, or pop into the Mental Health room. We’re not grading your dinner performance.`,
  },
  {
    slug: "diagnosis-grief",
    title: "Yeah, Diagnosis Can Feel Like Grief",
    pillar: "mental",
    category: "newly-diagnosed",
    type: "article",
    toolKey: null,
    content:
      "Missing spontaneity and shared plates isn’t dramatic — it’s human. Here’s how people move through it without rushing the feelings.",
    body: `Nobody hands you a pamphlet titled “Also you might mourn bagels.” But a lot of us do.

You might miss grab-and-go nights, family recipes, or the ease of saying yes to every invite. Anger at “just one bite” advice is valid. Relief and exhaustion can share a calendar invite.

What helps many of us:
- Name what you miss without roasting yourself for missing it.
- Keep one small ritual that still works — tea, a walk, that bakery that gets it.
- Talk to people living this (feed posts, Messenger rooms) instead of white-knuckling alone.
- Remember healing is measured in months, not “I should be fine by Monday.”

Grief doesn’t mean you’re bad at gluten-free. It means the change is real — and you’re allowed to take care of the soft parts too.`,
  },
  {
    slug: "social-isolation",
    title: "Staying Social When Every Invite Needs Logistics",
    pillar: "mental",
    category: "isolation",
    type: "article",
    toolKey: null,
    content:
      "Scripts that lower the temperature at shared meals — plus easy ways to find your people here.",
    body: `Isolation loves to dress up as “I’m just busy.” Sometimes you’re busy. Sometimes you’re tired of being the allergen detective at every table.

Scripts that help:
- “I’d love to come — can we pick somewhere with a dedicated GF option, or I’ll eat first and join for dessert/tea?”
- “I’m bringing a dish I trust so I can actually hang out instead of hovering by the kitchen.”
- “Rain check on dinner, but I’m free for a walk / coffee with something sealed.”

On Safely: open a room, follow folks who get it, and post when you need a reality check. Wanting company isn’t neediness — it’s how humans work.`,
  },
  {
    slug: "anxiety-toolkit",
    title: "A Pocket Toolkit for Food Anxiety",
    pillar: "mental",
    category: "anxiety",
    type: "exercise",
    toolKey: "anxiety-toolkit",
    content:
      "Box breathing, a tiny worry window, and a safe-foods list that proves dinner can still be calm.",
    body: `All-day vigilance is a full-time job nobody applied for. Small tools beat toughing it out.

Box breathing: inhale 4 · hold 4 · exhale 4 · hold 4. Four rounds. Phone timer optional, dramatic sighing encouraged.

Worry window: give food fears a 10-minute appointment, then park them until then. (Yes, your brain will try to renegotiate. That’s fine.)

Safe-foods anchor: list 5 meals you trust at home. When anxiety spikes, look at the list — proof that safety isn’t imaginary.

Pair it with a mood check-in on Track so patterns live somewhere besides your 2 a.m. thoughts.`,
  },
  {
    slug: "low-mood-chronic",
    title: "Low Mood & Living With a Chronic Thing",
    pillar: "mental",
    category: "depression",
    type: "article",
    toolKey: null,
    content:
      "Peer support helps — and sometimes you need a clinician who understands chronic illness. Here’s how to tell the difference.",
    body: `Repeated glutening, slow healing, and “can we just order pizza” culture can flatten a mood. You’re not imagining it.

Watch for: sleep that won’t cooperate, losing interest in things you usually like, hopelessness about food forever, pulling away from people who help.

This space is peer support, not therapy. If low mood sticks around most days for two weeks or more — or you have thoughts of harming yourself — reach out to a clinician or a local crisis line.

In the US, call or text 988. Needing more than an app doesn’t make you weak. It makes you someone who deserves care.`,
  },
  {
    slug: "gut-healing-basics",
    title: "Gut Healing Without the Miracle-Cure Energy",
    pillar: "physical",
    category: "gut",
    type: "article",
    toolKey: null,
    content:
      "Strict GF is the treatment; the lining still takes time. Nutrient-dense meals, rest, and your care team’s timeline win.",
    body: `Strict gluten-free eating is the treatment. Healing the lining is… slower than Instagram implies. Often months. Annoying, but true.

Practical basics:
- Stay strictly GF — cross-contact counts, even when it’s inconvenient.
- Lean on protein, iron-friendly foods, and simple meals while symptoms settle.
- Hydrate. Rest more than productivity culture would allow.
- Follow your GI’s plan for labs / follow-up timing.

Track flares on Track so you’re not reconstructing history from vibes at the appointment.`,
  },
  {
    slug: "nutrient-gaps",
    title: "Nutrient Gaps (Without the Supplement Spiral)",
    pillar: "physical",
    category: "nutrition",
    type: "tip",
    toolKey: null,
    content:
      "Iron, B12, D, calcium, and folate show up a lot. Ask about labs — skip the megadose internet shopping spree.",
    body: `Malabsorption + a suddenly smaller menu can leave gaps. Common ones: iron, B12, vitamin D, calcium, folate, sometimes zinc.

Please don’t megadose because a thread said so — some supplements fight each other or just… don’t absorb.

Ask your clinician which labs make sense, and whether a celiac-aware dietitian can peek at a real week of eating. Food-first when you can; targeted supplements when labs say so.`,
  },
  {
    slug: "after-glutening",
    title: "After Accidental Glutening",
    pillar: "physical",
    category: "recovery",
    type: "tip",
    toolKey: "glutening-checklist",
    content:
      "Rest, hydrate, known-safe foods, track symptoms. Most flares ease in a few days — call your doctor if it’s severe.",
    body: `Accidents happen to careful people. Recovery > self-roast.

Immediate: stop exposure, hydrate, rest, stick to simple foods you trust.
Next 48–72h: log severity on Track, sleep extra, skip hero workouts if you’re wiped.
Call your doctor for severe pain, persistent vomiting, dehydration, blood in stool, or symptoms that won’t ease.

Shame doesn’t heal anything. Rest and notes do. You’re still part of the club.`,
  },
  {
    slug: "fighting-fatigue",
    title: "When Fatigue Won’t Clock Out",
    pillar: "physical",
    category: "energy",
    type: "article",
    toolKey: null,
    content:
      "Healing is tiring. Sleep, protein, gentle daylight — and permission to not “push through.”",
    body: `Fatigue after diagnosis or a glutening is extremely common while iron stores and your intestine catch up.

Levers that often help: consistent sleep, protein at meals, short daylight walks, and treating “push through” as optional.

If fatigue is crushing or comes with dizziness, ask about anemia and vitamin D. Bring your Track log — patterns help clinicians take you seriously (and save you from a fuzzy memory monologue).`,
  },
  {
    slug: "labs-checklist",
    title: "Labs Worth Asking About",
    pillar: "physical",
    category: "labs",
    type: "tip",
    toolKey: "labs-checklist",
    content:
      "tTG-IgA (and total IgA), CBC, ferritin, vitamin D, B12 — a conversation starter for your next visit, not a prescription.",
    body: `Every care plan is individual — this is a friendly checklist, not medical orders.

Often discussed: tTG-IgA (+ total IgA), CBC, ferritin, vitamin D, B12, folate; bone density when risk factors apply.

Use the interactive checklist, then bring what you checked to your appointment. Educational only — your clinician decides what’s right for you.`,
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

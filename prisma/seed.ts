import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ensureHealthResources } from "./catalog";

const prisma = new PrismaClient();

const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function main() {
  console.log("🔵 Seeding Safely…");
  const passwordHash = await bcrypt.hash("password123", 10);

  const usersData = [
    { email: "maya@safely.app", username: "maya", name: "Maya Patel", role: "USER", bio: "Diagnosed 2021. Still gets weirdly emotional about good tortillas.", location: "Austin, TX", diagnosis: "celiac", journeyStage: "experienced", mood: "found a bakery that gets it", likeToMeet: "Anyone who rehearses the allergen question in the car", interests: "Safe dining · GF baking · late-night Messenger" },
    { email: "leo@safely.app", username: "leo", name: "Leo Martins", role: "USER", bio: "Dad of a celiac kiddo. Professional lunchbox diplomat.", location: "Portland, OR", diagnosis: "supporter", journeyStage: "caregiver", mood: "packing school snacks like a spy", likeToMeet: "Other GF parents & patient school advocates", interests: "Kid-friendly recipes · school IEPs · meal prep" },
    { email: "sara@safely.app", username: "sara", name: "Sara Kim", role: "USER", bio: "Gluten intolerance + strong opinions about toast. You’ve been warned.", location: "Brooklyn, NY", diagnosis: "gluten-intolerance", journeyStage: "intermediate", mood: "on a quest for the perfect loaf", likeToMeet: "Bakers, New Yorkers, fellow sauce detectives", interests: "Bread rankings · restaurants · hot takes" },
    { email: "admin@safely.app", username: "admin", name: "Safely Admin", role: "ADMIN", bio: "Keeping the rooms kind, weird, and welcoming.", location: "Remote", diagnosis: "supporter", journeyStage: "experienced", mood: "online if you need a hand", likeToMeet: "Kind community members", interests: "Moderation · community health" },
    { email: "theo@safely.app", username: "theo", name: "Theo Nguyen", role: "USER", bio: "Travel + gluten-free = my personality, my packing list, and half my photos.", location: "Austin, TX", diagnosis: "celiac", journeyStage: "experienced", mood: "plotting the next safe trip", likeToMeet: "Travelers who share phrase cards without judgment", interests: "Travel · AIC spots · street food" },
    { email: "priya@safely.app", username: "priya", name: "Priya Shah", role: "USER", bio: "Two weeks in. Learning labels like it’s a second language — because it kind of is.", location: "Brooklyn, NY", diagnosis: "celiac", journeyStage: "newly-diagnosed", mood: "still figuring out soy sauce", likeToMeet: "Newly diagnosed friends who ask the “dumb” questions too", interests: "Starter tips · mental health · labeling" },
  ];

  const users: Record<string, { id: string }> = {};
  for (const u of usersData) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        bio: u.bio,
        role: u.role,
        location: u.location,
        profile: {
          upsert: {
            create: {
              diagnosis: u.diagnosis,
              journeyStage: u.journeyStage,
              mood: u.mood,
              likeToMeet: u.likeToMeet,
              interests: u.interests,
            },
            update: {
              diagnosis: u.diagnosis,
              journeyStage: u.journeyStage,
              mood: u.mood,
              likeToMeet: u.likeToMeet,
              interests: u.interests,
            },
          },
        },
      },
      create: {
        email: u.email,
        username: u.username,
        name: u.name,
        role: u.role,
        bio: u.bio,
        location: u.location,
        passwordHash,
        presence: u.username === "maya" || u.username === "sara" || u.username === "theo" ? "online" : "offline",
        lastSeen: new Date(),
        profile: {
          create: {
            diagnosis: u.diagnosis,
            journeyStage: u.journeyStage,
            mood: u.mood,
            likeToMeet: u.likeToMeet,
            interests: u.interests,
          },
        },
      },
    });
    users[u.username] = { id: created.id };
  }

  const rooms = [
    { slug: "general-support", name: "General Support", description: "The living room of Safely — wins, questions, and mid-week pep talks." },
    { slug: "newly-diagnosed", name: "Newly Diagnosed", description: "Fresh labels, weird sauces, and people who just got here too." },
    { slug: "mental-health", name: "Mental Health", description: "Soft landings for hard days — judgment stays outside." },
    { slug: "parents", name: "Parents", description: "Lunchbox diplomacy, school emails, and high-fives that count." },
    { slug: "teens", name: "Teens", description: "GF life without the grown-up lecture energy." },
  ];
  const roomIds: Record<string, string> = {};
  for (const r of rooms) {
    const created = await prisma.chatRoom.upsert({
      where: { slug: r.slug },
      update: { name: r.name, description: r.description },
      create: { ...r, isCommunity: true },
    });
    roomIds[r.slug] = created.id;
  }

  for (const u of Object.values(users)) {
    for (const roomId of Object.values(roomIds)) {
      await prisma.chatRoomMember.upsert({
        where: { roomId_userId: { roomId, userId: u.id } },
        update: {},
        create: { roomId, userId: u.id },
      });
    }
  }

  // Refresh demo lounge chat so local seed always matches the warm voice
  {
    const general = roomIds["general-support"];
    await prisma.message.deleteMany({ where: { roomId: general } });
    const convo: [string, string][] = [
      ["maya", "Okay but the dedicated GF bakery downtown? I may have teared up over a croissant. No regrets."],
      ["sara", "Name. Location. Immediately. Don’t leave us hanging."],
      ["theo", "This is why I stick around — the snack intel is elite."],
      ["priya", "Hi friends — two weeks post diagnosis and still side-eyeing soy sauce. Any starter tips?"],
      ["maya", "Welcome, Priya. We’ve all been the new person. Ask anything — even the “is this silly?” stuff."],
      ["leo", "Newly Diagnosed room is cozy for that. Also: you are doing better than you think."],
    ];
    let t = Date.now() - convo.length * 60000;
    for (const [uname, content] of convo) {
      await prisma.message.create({
        data: { roomId: general, senderId: users[uname].id, content, createdAt: new Date(t) },
      });
      t += 60000;
    }
  }

  // Refresh demo feed posts (local seed only)
  {
    await prisma.comment.deleteMany({});
    await prisma.like.deleteMany({});
    await prisma.post.deleteMany({});
    const posts: {
      author: string;
      category: string;
      title: string;
      content: string;
      image: string | null;
      comment: { author: string; content: string };
    }[] = [
      {
        author: "maya",
        category: "restaurants",
        title: "Mariposa let me order without giving a TED Talk",
        content:
          "Dedicated fryer, separate prep, and the server finished my sentence about cross-contact. I ate tacos like a civilian. If you’re in Austin and tired of negotiating dinner — go. Tell them Maya sent you (they won’t know me, but it feels nice).",
        image: "post-mariposa",
        comment: {
          author: "theo",
          content: "Saving this for my next trip through town. Civilian tacos are a human right.",
        },
      },
      {
        author: "priya",
        category: "newly-diagnosed",
        title: "Two weeks in — what blindsided you?",
        content:
          "Just diagnosed and my kitchen looks like a crime scene of discarded sauces. What’s the non-obvious stuff — meds, spices, “natural flavors”? Sending hugs to anyone else still reading labels in the parking lot.",
        image: null,
        comment: {
          author: "maya",
          content: "Lipstick and playdough got me once. You’re not behind — you’re thorough. Ask away anytime.",
        },
      },
      {
        author: "leo",
        category: "kids-with-celiac",
        title: "School lunch wins (the rotation that finally stuck)",
        content:
          "After a month of sad sandwiches, here’s what my 7yo actually eats: tenders + fruit + a joke note. Happy to share the weekly grid if anyone wants it — parents, we are in this casserole together.",
        image: "post-lunch",
        comment: {
          author: "sara",
          content: "Please share the grid. My fridge needs a personality transplant.",
        },
      },
      {
        author: "sara",
        category: "recipes",
        title: "I ranked 11 GF breads so you don’t have to",
        content:
          "Most of them crumbled like sad sandcastles. One toasts like it pays rent. Full spicy ranking in the comments — bring opinions, leave crumb trauma at the door.",
        image: "post-bread",
        comment: {
          author: "leo",
          content: "As a toast-dependent household: bless you for your service.",
        },
      },
      {
        author: "theo",
        category: "travel",
        title: "Rome was shockingly celiac-friendly (AIC for the win)",
        content:
          "Phrase card + certified spots = I ate pasta without a backup plan for once. Dropping my list + the exact card wording if anyone’s Italy-bound. Travel is still a puzzle — just a prettier one.",
        image: "post-rome",
        comment: {
          author: "priya",
          content: "This gives me hope that vacations aren’t canceled forever. Phrase card please!",
        },
      },
      {
        author: "maya",
        category: "mental-health",
        title: "Missing “just grabbing something” is allowed",
        content:
          "Nobody warned me about mourning spontaneity. You’re not dramatic for missing shared plates. Be gentle with yourself — and if you need company, the Mental Health room is weirdly cozy for hard days.",
        image: null,
        comment: {
          author: "leo",
          content: "Needed this today. Softness counts as a strategy.",
        },
      },
    ];
    for (const [i, p] of posts.entries()) {
      const post = await prisma.post.create({
        data: {
          authorId: users[p.author].id,
          category: p.category,
          title: p.title,
          content: p.content,
          imageUrl: p.image ? img(p.image) : null,
          createdAt: new Date(Date.now() - (posts.length - i) * 3600_000),
        },
      });
      for (const l of ["maya", "sara", "theo"].filter(() => Math.random() > 0.3)) {
        await prisma.like
          .upsert({
            where: { postId_userId: { postId: post.id, userId: users[l].id } },
            update: {},
            create: { postId: post.id, userId: users[l].id },
          })
          .catch(() => {});
      }
      await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: users[p.comment.author].id,
          content: p.comment.content,
        },
      });
    }
  }

  if ((await prisma.restaurant.count()) === 0) {
    const restaurants = [
      { name: "Mariposa Kitchen", city: "Austin", address: "1200 S Congress Ave", lat: 30.249, lng: -97.749, cuisine: "Mexican", priceLevel: 2, dedicatedFryer: true, separatePrepArea: true, dedicatedKitchen: true, certified: true, glutenFreeMenu: true, celiacSafe: true, delivery: true, staffTrainingLevel: "expert", communityConfidence: 92, img: "rest-mariposa", desc: "100% GF kitchen with a dedicated fryer — the rare place where you can order without a TED Talk first." },
      { name: "Hearth & Sage", city: "Portland", address: "88 NW 23rd Ave", lat: 45.529, lng: -122.698, cuisine: "American", priceLevel: 3, dedicatedFryer: false, separatePrepArea: true, dedicatedKitchen: false, certified: false, glutenFreeMenu: true, celiacSafe: true, delivery: false, staffTrainingLevel: "trained", communityConfidence: 78, img: "rest-hearth", desc: "Seasonal plates and a crew that actually knows what cross-contact means. Cozy, not precious." },
      { name: "Nonna's GF Trattoria", city: "Brooklyn", address: "455 Court St", lat: 40.678, lng: -73.999, cuisine: "Italian", priceLevel: 2, dedicatedFryer: true, separatePrepArea: true, dedicatedKitchen: true, certified: true, glutenFreeMenu: true, celiacSafe: true, delivery: true, staffTrainingLevel: "expert", communityConfidence: 95, img: "rest-nonna", desc: "Entirely gluten-free Italian. Bring tissues for the cacio e pepe — happy tears only." },
      { name: "Blue Lotus Thai", city: "San Francisco", address: "21 Valencia St", lat: 37.769, lng: -122.422, cuisine: "Thai", priceLevel: 2, dedicatedFryer: false, separatePrepArea: true, dedicatedKitchen: false, certified: false, glutenFreeMenu: true, celiacSafe: false, delivery: true, staffTrainingLevel: "basic", communityConfidence: 61, img: "rest-thai", desc: "Plenty of GF-friendly dishes if you ask about soy sauce and shared woks. Worth the careful order." },
      { name: "Coastline Poke", city: "Austin", address: "500 W 2nd St", lat: 30.266, lng: -97.752, cuisine: "Hawaiian", priceLevel: 2, dedicatedFryer: false, separatePrepArea: true, dedicatedKitchen: false, certified: false, glutenFreeMenu: true, celiacSafe: true, delivery: true, staffTrainingLevel: "trained", communityConfidence: 81, img: "rest-poke", desc: "Build-a-bowl heaven with allergens marked like they mean it. Fast, bright, low drama." },
      { name: "The Daily Grind", city: "Chicago", address: "900 W Randolph", lat: 41.884, lng: -87.651, cuisine: "Cafe", priceLevel: 1, dedicatedFryer: false, separatePrepArea: false, dedicatedKitchen: false, certified: false, glutenFreeMenu: false, celiacSafe: false, delivery: true, staffTrainingLevel: "none", communityConfidence: 38, img: "rest-cafe", desc: "Cute coffee, tricky kitchen. Fine for sealed drinks — skip the pastry case if you’re celiac-careful." },
    ];
    for (const r of restaurants) {
      const created = await prisma.restaurant.create({
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
      await prisma.restaurantReview.create({
        data: {
          restaurantId: created.id,
          userId: users["maya"].id,
          rating: Math.min(5, Math.round(r.communityConfidence / 20)),
          safetyRating: Math.min(5, Math.round(r.communityConfidence / 20)),
          content: r.celiacSafe
            ? "Felt taken care of the whole meal — staff knew their stuff and I could actually taste my food instead of my anxiety."
            : "Cute spot, but I’d ask a lot of questions. Sealed drinks yes; shared fryer vibes no.",
        },
      });
    }
  }

  if ((await prisma.recipe.count()) === 0) {
    const recipes = [
      { author: "maya", title: "Banana Oat Pancakes (No Fancy Flour Required)", category: "Quick Meals", desc: "Weekend energy on a Tuesday. Blender, pan, maple — done before the coffee cools.", prep: 5, cook: 10, servings: 2, cal: 320, protein: 11, carbs: 52, fat: 7, img: "rec-pancakes", ingredients: ["2 ripe bananas", "2 eggs", "1 cup certified GF oats", "1 tsp baking powder", "Pinch of cinnamon"], steps: ["Blend everything until mostly smooth (a few oat flecks are charming).", "Warm a non-stick pan over medium — not screaming hot.", "Pour small rounds; flip when bubbles look confident, about 2 min a side.", "Stack with berries and maple. Pretend you planned brunch."] },
      { author: "sara", title: "Sandwich Bread That Doesn't Crumble Mid-Bite", category: "Baking", desc: "Soft, sliceable, toast-friendly. The loaf that makes school lunches feel normal again.", prep: 20, cook: 50, servings: 10, cal: 180, protein: 4, carbs: 30, fat: 5, img: "rec-bread", ingredients: ["3 cups GF flour blend", "1 packet yeast", "2 tbsp psyllium husk", "1.5 cups warm water", "2 tbsp olive oil"], steps: ["Mix dry, then wet — batter will look sticky, that’s the deal.", "Scoop into a greased loaf pan and let it rise 45 min.", "Bake at 375°F for about 50 min until the top sounds hollow.", "Cool completely before slicing (patience = cleaner sandwiches)."] },
      { author: "leo", title: "Crispy Chicken Tenders Kids Actually Finish", category: "Kids", desc: "Oven-crispy, dunkable, and suspiciously popular with adults who “just want one.”", prep: 15, cook: 18, servings: 4, cal: 410, protein: 32, carbs: 22, fat: 19, img: "rec-tenders", ingredients: ["1 lb chicken tenders", "1 cup GF breadcrumbs", "2 eggs", "Paprika & garlic powder", "Olive oil spray"], steps: ["Egg wash station + seasoned crumb station — classic assembly line.", "Coat tenders, give them a light oil mist.", "Bake at 425°F for 18 min, flipping once for even crunch.", "Serve with a GF dip and zero negotiations required."] },
      { author: "theo", title: "Weeknight Veggie Pad Thai", category: "Vegan", desc: "Tangy, crunchy, ready before delivery would even leave the restaurant.", prep: 10, cook: 10, servings: 3, cal: 390, protein: 12, carbs: 60, fat: 10, img: "rec-padthai", ingredients: ["8 oz rice noodles", "Tamarind paste", "Tamari (GF)", "Tofu", "Bean sprouts & peanuts"], steps: ["Soak noodles in hot water until bendy, not mushy.", "Stir-fry tofu and veg until they smell like a good decision.", "Toss in sauce and noodles — work fast, keep it glossy.", "Finish with peanuts, lime, and whatever herbs you have left."] },
      { author: "maya", title: "Big Pot Lentil Soup (Freezer Hero)", category: "Budget", desc: "Cheap, cozy, and future-you will thank present-you on a tired Thursday.", prep: 10, cook: 30, servings: 6, cal: 260, protein: 15, carbs: 38, fat: 4, img: "rec-soup", ingredients: ["2 cups red lentils", "1 onion", "2 carrots", "GF veg stock", "Cumin & smoked paprika"], steps: ["Sauté onion and carrot until soft and sweet.", "Add lentils, spices, and stock; bring to a friendly simmer.", "Cook about 30 min until lentils melt into the broth.", "Blend half if you want creaminess without cream."] },
      { author: "sara", title: "Quinoa Bowl That Meal-Preps Nicely", category: "High Protein", desc: "Chickpeas, greens, tahini — pack four lunches and feel briefly unstoppable.", prep: 15, cook: 20, servings: 4, cal: 480, protein: 28, carbs: 45, fat: 18, img: "rec-quinoa", ingredients: ["1 cup quinoa", "1 can chickpeas", "2 cups spinach", "1 avocado", "Tahini-lemon dressing"], steps: ["Cook quinoa like the package says (you’ve got this).", "Roast chickpeas at 400°F for 20 min for crunch.", "Build bowls with greens, quinoa, chickpeas, avocado.", "Drizzle dressing; keep avocado separate if packing ahead."] },
    ];
    for (const r of recipes) {
      const created = await prisma.recipe.create({
        data: {
          authorId: users[r.author].id,
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
          ingredients: r.ingredients,
          steps: r.steps,
        },
      });
      await prisma.recipeRating.upsert({
        where: { recipeId_userId: { recipeId: created.id, userId: users["sara"].id } },
        update: { review: "Made this twice already — house favorite." },
        create: { recipeId: created.id, userId: users["sara"].id, rating: 5, review: "Made this twice already — house favorite." },
      });
    }
  }

  await ensureHealthResources(prisma);

  if ((await prisma.moodEntry.count({ where: { userId: users["maya"].id } })) === 0) {
    for (const [d, mood, note] of [
      [6, 3, "Accidental glutening — resting, not self-roasting."],
      [4, 4, "Cooked something great at home. Felt proud."],
      [2, 5, "Found a restaurant that actually gets it!"],
      [0, 4, "Hopeful day. Small wins count."],
    ] as [number, number, string][]) {
      await prisma.moodEntry.create({
        data: {
          userId: users["maya"].id,
          mood,
          note,
          createdAt: new Date(Date.now() - d * 86400_000),
        },
      });
    }
    await prisma.journalEntry.create({
      data: {
        userId: users["maya"].id,
        prompt: "What is one tiny win from today?",
        content: "I ate out and felt fine after. Small win, big exhale.",
      },
    });
  }

  for (const [a, b] of [
    ["priya", "maya"],
    ["sara", "maya"],
    ["theo", "maya"],
    ["leo", "maya"],
  ] as const) {
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: users[a].id,
          followingId: users[b].id,
        },
      },
      update: {},
      create: { followerId: users[a].id, followingId: users[b].id },
    });
  }

  console.log("✅ Seed complete.");
  console.log("   Demo login → maya@safely.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

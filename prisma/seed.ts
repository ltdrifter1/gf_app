import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function main() {
  console.log("🔵 Seeding Circle…");
  const passwordHash = await bcrypt.hash("password123", 10);

  const usersData = [
    { email: "maya@circle.app", username: "maya", name: "Maya Patel", role: "USER", bio: "Diagnosed 2021. Sharing my safe-eating wins 🔵", location: "Austin, TX", diagnosis: "celiac" },
    { email: "leo@circle.app", username: "leo", name: "Leo Martins", role: "USER", bio: "Dad of a celiac kiddo. Here for the community.", location: "Portland, OR", diagnosis: "supporter" },
    { email: "sara@circle.app", username: "sara", name: "Sara Kim", role: "USER", bio: "Gluten intolerance + lots of opinions on bread.", location: "Brooklyn, NY", diagnosis: "gluten-intolerance" },
    { email: "admin@circle.app", username: "admin", name: "Circle Admin", role: "ADMIN", bio: "Keeping the community safe & kind.", location: "Remote", diagnosis: "supporter" },
    { email: "theo@circle.app", username: "theo", name: "Theo Nguyen", role: "USER", bio: "Travel + gluten-free = my whole personality ✈️", location: "Austin, TX", diagnosis: "celiac" },
    { email: "priya@circle.app", username: "priya", name: "Priya Shah", role: "USER", bio: "Newly diagnosed and figuring it out.", location: "Brooklyn, NY", diagnosis: "celiac" },
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
        profile: { create: { diagnosis: u.diagnosis } },
      },
    });
    users[u.username] = { id: created.id };
  }

  const rooms = [
    { slug: "general-support", name: "General Support", description: "The main lounge — everyone welcome." },
    { slug: "newly-diagnosed", name: "Newly Diagnosed", description: "Just starting out? We've got you." },
    { slug: "mental-health", name: "Mental Health", description: "A gentle space to talk feelings." },
    { slug: "parents", name: "Parents", description: "Raising celiac kids together." },
    { slug: "teens", name: "Teens", description: "For younger members navigating GF life." },
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

  if ((await prisma.message.count()) === 0) {
    const general = roomIds["general-support"];
    const convo: [string, string][] = [
      ["maya", "Morning everyone ☀️ Found a bakery with a dedicated GF kitchen yesterday — crying happy tears"],
      ["sara", "No way! Drop it in Safe Dining please 🙏"],
      ["theo", "This is why I love this place lol"],
      ["priya", "Hi all — 2 weeks post diagnosis and a little overwhelmed honestly"],
      ["maya", "Welcome Priya 💙 it gets so much easier, promise. Ask us anything"],
      ["leo", "The newly-diagnosed room has a great starter vibe too!"],
    ];
    let t = Date.now() - convo.length * 60000;
    for (const [uname, content] of convo) {
      await prisma.message.create({
        data: { roomId: general, senderId: users[uname].id, content, createdAt: new Date(t) },
      });
      t += 60000;
    }
  }

  if ((await prisma.post.count()) === 0) {
    const posts = [
      { author: "maya", category: "restaurants", title: "Mariposa Kitchen is 100% celiac safe!", content: "Dedicated fryer, separate prep area, and the staff actually understood cross-contamination. First time in months I ate out without anxiety. Highly recommend 🌮", image: "post-mariposa" },
      { author: "priya", category: "newly-diagnosed", title: "Two weeks in — what do you wish you knew?", content: "Just diagnosed and my head is spinning. What are the non-obvious things I should watch out for? Sauces? Medications? Sending hugs to everyone here.", image: null },
      { author: "leo", category: "kids-with-celiac", title: "School lunch wins for celiac kids", content: "After a rough start, here's our rotation that my 7yo actually eats. Happy to share the full meal plan if anyone wants it!", image: "post-lunch" },
      { author: "sara", category: "recipes", title: "Best GF bread I've found (not even close)", content: "Tried 11 brands. This one toasts like real bread and doesn't crumble. Full ranking in the comments.", image: "post-bread" },
      { author: "theo", category: "travel", title: "Ate my way through Rome 100% gluten-free", content: "Italy is shockingly celiac-friendly thanks to AIC certification. Here's my list of certified spots and the phrase card I used.", image: "post-rome" },
      { author: "maya", category: "mental-health", title: "The grief of diagnosis is real", content: "Nobody warned me about the emotional side. Mourning spontaneity and 'just grabbing something' is valid. You're not being dramatic. 💙", image: null },
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
          authorId: users["sara"].id,
          content: "This is so helpful, thank you for sharing 💛",
        },
      });
    }
  }

  if ((await prisma.restaurant.count()) === 0) {
    const restaurants = [
      { name: "Mariposa Kitchen", city: "Austin", address: "1200 S Congress Ave", lat: 30.249, lng: -97.749, cuisine: "Mexican", priceLevel: 2, dedicatedFryer: true, separatePrepArea: true, dedicatedKitchen: true, certified: true, glutenFreeMenu: true, celiacSafe: true, delivery: true, staffTrainingLevel: "expert", communityConfidence: 92, img: "rest-mariposa", desc: "100% gluten-free kitchen with a dedicated fryer. A celiac safe haven." },
      { name: "Hearth & Sage", city: "Portland", address: "88 NW 23rd Ave", lat: 45.529, lng: -122.698, cuisine: "American", priceLevel: 3, dedicatedFryer: false, separatePrepArea: true, dedicatedKitchen: false, certified: false, glutenFreeMenu: true, celiacSafe: true, delivery: false, staffTrainingLevel: "trained", communityConfidence: 78, img: "rest-hearth", desc: "Farm-to-table with a thoughtful GF menu and trained staff." },
      { name: "Nonna's GF Trattoria", city: "Brooklyn", address: "455 Court St", lat: 40.678, lng: -73.999, cuisine: "Italian", priceLevel: 2, dedicatedFryer: true, separatePrepArea: true, dedicatedKitchen: true, certified: true, glutenFreeMenu: true, celiacSafe: true, delivery: true, staffTrainingLevel: "expert", communityConfidence: 95, img: "rest-nonna", desc: "Entirely gluten-free Italian. The pasta will make you cry." },
      { name: "Blue Lotus Thai", city: "San Francisco", address: "21 Valencia St", lat: 37.769, lng: -122.422, cuisine: "Thai", priceLevel: 2, dedicatedFryer: false, separatePrepArea: true, dedicatedKitchen: false, certified: false, glutenFreeMenu: true, celiacSafe: false, delivery: true, staffTrainingLevel: "basic", communityConfidence: 61, img: "rest-thai", desc: "Lots of GF options; ask about soy sauce and shared woks." },
      { name: "Coastline Poke", city: "Austin", address: "500 W 2nd St", lat: 30.266, lng: -97.752, cuisine: "Hawaiian", priceLevel: 2, dedicatedFryer: false, separatePrepArea: true, dedicatedKitchen: false, certified: false, glutenFreeMenu: true, celiacSafe: true, delivery: true, staffTrainingLevel: "trained", communityConfidence: 81, img: "rest-poke", desc: "Naturally GF-friendly bowls with clearly marked allergens." },
      { name: "The Daily Grind", city: "Chicago", address: "900 W Randolph", lat: 41.884, lng: -87.651, cuisine: "Cafe", priceLevel: 1, dedicatedFryer: false, separatePrepArea: false, dedicatedKitchen: false, certified: false, glutenFreeMenu: false, celiacSafe: false, delivery: true, staffTrainingLevel: "none", communityConfidence: 38, img: "rest-cafe", desc: "Limited GF; cross-contamination risk is real here." },
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
            ? "Felt safe the whole time, staff knew their stuff."
            : "Okay but I'd be careful — ask lots of questions.",
        },
      });
    }
  }

  if ((await prisma.recipe.count()) === 0) {
    const recipes = [
      { author: "maya", title: "5-Minute Banana Oat Pancakes", category: "Quick Meals", desc: "Fluffy, naturally gluten-free pancakes with just a few ingredients.", prep: 5, cook: 10, servings: 2, cal: 320, protein: 11, carbs: 52, fat: 7, img: "rec-pancakes", ingredients: ["2 ripe bananas", "2 eggs", "1 cup certified GF oats", "1 tsp baking powder", "Pinch of cinnamon"], steps: ["Blend all ingredients until smooth.", "Heat a non-stick pan over medium.", "Pour small rounds and cook 2 min per side.", "Serve with berries and maple syrup."] },
      { author: "sara", title: "No-Knead GF Sandwich Bread", category: "Baking", desc: "Soft, sliceable bread that actually tastes like bread.", prep: 20, cook: 50, servings: 10, cal: 180, protein: 4, carbs: 30, fat: 5, img: "rec-bread", ingredients: ["3 cups GF flour blend", "1 packet yeast", "2 tbsp psyllium husk", "1.5 cups warm water", "2 tbsp olive oil"], steps: ["Mix dry, then wet ingredients.", "Let rise 45 min in a loaf pan.", "Bake at 375°F for 50 min.", "Cool fully before slicing."] },
      { author: "leo", title: "Kid-Friendly GF Chicken Tenders", category: "Kids", desc: "Crispy tenders the whole family will fight over.", prep: 15, cook: 18, servings: 4, cal: 410, protein: 32, carbs: 22, fat: 19, img: "rec-tenders", ingredients: ["1 lb chicken tenders", "1 cup GF breadcrumbs", "2 eggs", "Paprika & garlic powder", "Olive oil spray"], steps: ["Set up egg and breadcrumb stations.", "Coat tenders, then spray with oil.", "Bake at 425°F for 18 min, flipping once.", "Serve with GF dipping sauce."] },
      { author: "theo", title: "15-Minute Veggie Pad Thai", category: "Vegan", desc: "Rice noodles, crunchy veg, and a tangy tamarind sauce.", prep: 10, cook: 10, servings: 3, cal: 390, protein: 12, carbs: 60, fat: 10, img: "rec-padthai", ingredients: ["8 oz rice noodles", "Tamarind paste", "Tamari (GF)", "Tofu", "Bean sprouts & peanuts"], steps: ["Soak noodles in hot water.", "Stir-fry tofu and veg.", "Add sauce and noodles, toss.", "Top with peanuts and lime."] },
      { author: "maya", title: "Budget GF Lentil Soup", category: "Budget", desc: "Hearty, cheap, and freezer-friendly.", prep: 10, cook: 30, servings: 6, cal: 260, protein: 15, carbs: 38, fat: 4, img: "rec-soup", ingredients: ["2 cups red lentils", "1 onion", "2 carrots", "GF veg stock", "Cumin & smoked paprika"], steps: ["Sauté onion and carrot.", "Add lentils, spices, and stock.", "Simmer 30 min.", "Blend half for creaminess."] },
      { author: "sara", title: "High-Protein Quinoa Power Bowl", category: "High Protein", desc: "A satisfying, balanced bowl that meal-preps beautifully.", prep: 15, cook: 20, servings: 4, cal: 480, protein: 28, carbs: 45, fat: 18, img: "rec-quinoa", ingredients: ["1 cup quinoa", "1 can chickpeas", "2 cups spinach", "1 avocado", "Tahini-lemon dressing"], steps: ["Cook quinoa per package.", "Roast chickpeas at 400°F for 20 min.", "Assemble bowls with greens and avocado.", "Drizzle dressing and serve."] },
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
        update: {},
        create: { recipeId: created.id, userId: users["sara"].id, rating: 5, review: "Made this twice already!" },
      });
    }
  }

  if ((await prisma.healthResource.count()) === 0) {
    const resources = [
      { title: "Calming the Eating-Out Spiral", pillar: "mental", category: "eating-out", type: "exercise", content: "A 4-step grounding exercise for when restaurant anxiety hits: breathe, plan, ask, and self-compassion." },
      { title: "When Diagnosis Feels Like Grief", pillar: "mental", category: "newly-diagnosed", type: "article", content: "Mourning your old relationship with food is normal. Naming the grief is the first step to moving through it." },
      { title: "Beating Social Isolation", pillar: "mental", category: "isolation", type: "article", content: "Practical scripts for navigating shared meals, plus how to find your people in Messenger." },
      { title: "Anxiety Toolkit for Celiac Life", pillar: "mental", category: "anxiety", type: "exercise", content: "Box breathing, worry windows, and a 'safe foods' anchor list to reduce daily anxiety." },
      { title: "Low Mood & Chronic Illness", pillar: "mental", category: "depression", type: "article", content: "What to look for in support, and when to reach out to a clinician who understands chronic illness." },
      { title: "Gut Healing Basics After Diagnosis", pillar: "physical", category: "gut", type: "article", content: "The small intestine needs time. Focus on nutrient-dense GF meals, hydration, and following your care team's timeline for follow-up." },
      { title: "Common Nutrient Gaps", pillar: "physical", category: "nutrition", type: "tip", content: "Iron, B12, vitamin D, calcium, and folate are commonly low. Ask about labs — don't self-supplement blindly." },
      { title: "What To Do After Accidental Glutening", pillar: "physical", category: "recovery", type: "tip", content: "Rest, hydrate, stick to known-safe foods, and track symptoms. Most flares ease in a few days — contact your doctor if severe." },
      { title: "Fighting the Fatigue", pillar: "physical", category: "energy", type: "article", content: "Fatigue can linger while healing. Prioritize sleep, protein at meals, and gentle movement when you can." },
      { title: "Labs Worth Asking About", pillar: "physical", category: "labs", type: "tip", content: "tTG-IgA (and total IgA), CBC, ferritin, vitamin D, B12, and bone density when indicated. Bring a list to your next visit." },
    ];
    for (const r of resources) {
      await prisma.healthResource.create({ data: r });
    }
  }

  if ((await prisma.moodEntry.count({ where: { userId: users["maya"].id } })) === 0) {
    for (const [d, mood, note] of [
      [6, 3, "Tough day, glutened by accident."],
      [4, 4, "Cooked a great dinner at home."],
      [2, 5, "Found a safe restaurant!"],
      [0, 4, "Feeling hopeful."],
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
        prompt: "What is one thing that went well today?",
        content: "I finally ate out without a stomachache. Small win, big feeling.",
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
  console.log("   Demo login → maya@circle.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

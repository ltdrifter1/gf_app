import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function main() {
  console.log("🌱 Seeding Gluten Free Collective…");
  const passwordHash = await bcrypt.hash("password123", 10);

  // ----------------------------- Users -----------------------------
  const usersData = [
    { email: "maya@glutenfree.dev", username: "maya", name: "Maya Patel", role: "USER", bio: "Diagnosed 2021. Sharing my safe-eating wins 🌱", location: "Austin, TX", lat: 30.2672, lng: -97.7431, isPremium: true, diagnosis: "celiac" },
    { email: "leo@glutenfree.dev", username: "leo", name: "Leo Martins", role: "USER", bio: "Dad of a celiac kiddo. Here for the recipes.", location: "Portland, OR", lat: 45.5152, lng: -122.6784, diagnosis: "supporter" },
    { email: "sara@glutenfree.dev", username: "sara", name: "Sara Kim", role: "USER", bio: "Gluten intolerance + lots of opinions on bread.", location: "Brooklyn, NY", lat: 40.6782, lng: -73.9442, diagnosis: "gluten-intolerance" },
    { email: "drchen@glutenfree.dev", username: "drchen", name: "Dr. Amara Chen", role: "PROFESSIONAL", bio: "Gastroenterologist specializing in celiac disease.", location: "San Francisco, CA", lat: 37.7749, lng: -122.4194, diagnosis: "supporter" },
    { email: "nina@glutenfree.dev", username: "nina", name: "Nina Alvarez, RD", role: "PROFESSIONAL", bio: "Registered dietitian. Nutrition without fear.", location: "Chicago, IL", lat: 41.8781, lng: -87.6298, diagnosis: "supporter" },
    { email: "admin@glutenfree.dev", username: "admin", name: "Collective Admin", role: "ADMIN", bio: "Keeping the community safe & kind.", location: "Remote", diagnosis: "supporter" },
    { email: "theo@glutenfree.dev", username: "theo", name: "Theo Nguyen", role: "USER", bio: "Travel + gluten-free = my whole personality ✈️", location: "Austin, TX", lat: 30.27, lng: -97.74, diagnosis: "celiac" },
    { email: "priya@glutenfree.dev", username: "priya", name: "Priya Shah", role: "USER", bio: "Newly diagnosed and figuring it out.", location: "Brooklyn, NY", lat: 40.68, lng: -73.95, diagnosis: "celiac" },
  ];

  const users: Record<string, { id: string }> = {};
  for (const u of usersData) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, bio: u.bio, role: u.role, isPremium: u.isPremium ?? false, location: u.location, lat: u.lat ?? null, lng: u.lng ?? null },
      create: {
        email: u.email,
        username: u.username,
        name: u.name,
        role: u.role,
        bio: u.bio,
        location: u.location,
        lat: u.lat ?? null,
        lng: u.lng ?? null,
        isPremium: u.isPremium ?? false,
        passwordHash,
        presence: u.username === "maya" || u.username === "sara" || u.username === "theo" ? "online" : "offline",
        lastSeen: new Date(),
        profile: { create: { diagnosis: u.diagnosis, showOnMap: true, shareLocation: true } },
        subscription: { create: { plan: u.isPremium ? "premium" : "free", status: u.isPremium ? "active" : "inactive" } },
      },
    });
    users[u.username] = { id: created.id };
  }

  // Make professionals verified
  for (const uname of ["drchen", "nina"]) {
    const u = users[uname];
    const meta = usersData.find((x) => x.username === uname)!;
    await prisma.healthcareProfessional.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        credentials: uname === "drchen" ? "MD, Gastroenterology" : "MS, RD, CDN",
        specialty: uname === "drchen" ? "Celiac disease & autoimmune GI" : "Gluten-free nutrition",
        verified: true,
        badge: "verified",
        bio: meta.bio,
      },
    });
  }

  // ----------------------------- Chat rooms -----------------------------
  const rooms = [
    { slug: "general-support", name: "General Support", description: "The main lounge — everyone welcome." },
    { slug: "newly-diagnosed", name: "Newly Diagnosed", description: "Just starting out? We've got you." },
    { slug: "mental-health", name: "Mental Health", description: "A gentle space to talk feelings." },
    { slug: "parents", name: "Parents", description: "Raising celiac kids together." },
    { slug: "travel", name: "Travel", description: "Eating safely around the world." },
    { slug: "teens", name: "Teens", description: "For younger members navigating GF life." },
    { slug: "local-community-groups", name: "Local Community Groups", description: "Find your people nearby." },
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

  // All users join all community rooms
  for (const u of Object.values(users)) {
    for (const roomId of Object.values(roomIds)) {
      await prisma.chatRoomMember.upsert({
        where: { roomId_userId: { roomId, userId: u.id } },
        update: {},
        create: { roomId, userId: u.id },
      });
    }
  }

  // Seed some messages once
  if ((await prisma.message.count()) === 0) {
    const general = roomIds["general-support"];
    const convo: [string, string][] = [
      ["maya", "Morning everyone ☀️ Found a bakery with a dedicated GF kitchen yesterday — crying happy tears"],
      ["sara", "No way! Drop the location in Safe Dining please 🙏"],
      ["theo", "This is why I love this place lol"],
      ["priya", "Hi all — 2 weeks post diagnosis and a little overwhelmed honestly"],
      ["maya", "Welcome Priya 💙 it gets so much easier, promise. Ask us anything"],
      ["leo", "The newly-diagnosed room has a great starter guide too!"],
    ];
    let t = Date.now() - convo.length * 60000;
    for (const [uname, content] of convo) {
      await prisma.message.create({
        data: { roomId: general, senderId: users[uname].id, content, createdAt: new Date(t) },
      });
      t += 60000;
    }
    await prisma.message.create({
      data: { roomId: roomIds["newly-diagnosed"], senderId: users["priya"].id, content: "Is cross-contamination really that big a deal at home if no one else is GF?", createdAt: new Date(Date.now() - 120000) },
    });
    await prisma.message.create({
      data: { roomId: roomIds["newly-diagnosed"], senderId: users["nina"].id, content: "Great question! Separate toaster + butter/condiments are the big ones. Happy to share a checklist 💛", createdAt: new Date(Date.now() - 60000) },
    });
  }

  // ----------------------------- Posts -----------------------------
  if ((await prisma.post.count()) === 0) {
    const posts = [
      { author: "maya", category: "restaurants", title: "Mariposa Kitchen is 100% celiac safe!", content: "Dedicated fryer, separate prep area, and the staff actually understood cross-contamination. First time in months I ate out without anxiety. Highly recommend 🌮", image: "post-mariposa" },
      { author: "priya", category: "newly-diagnosed", title: "Two weeks in — what do you wish you knew?", content: "Just diagnosed and my head is spinning. What are the non-obvious things I should watch out for? Sauces? Medications? Sending hugs to everyone here.", image: null },
      { author: "leo", category: "kids-with-celiac", title: "School lunch wins for celiac kids", content: "After a rough start, here's our rotation that my 7yo actually eats. Happy to share the full meal plan if anyone wants it!", image: "post-lunch" },
      { author: "sara", category: "product-reviews", title: "Best GF bread I've found (not even close)", content: "Tried 11 brands. This one toasts like real bread and doesn't crumble. Full ranking in the comments.", image: "post-bread" },
      { author: "theo", category: "travel", title: "Ate my way through Rome 100% gluten-free", content: "Italy is shockingly celiac-friendly thanks to AIC certification. Here's my list of certified spots and the phrase card I used.", image: "post-rome" },
      { author: "maya", category: "mental-health", title: "The grief of diagnosis is real", content: "Nobody warned me about the emotional side. Mourning spontaneity and 'just grabbing something' is valid. You're not being dramatic. 💙", image: null },
      { author: "nina", category: "research", title: "New study on oats & celiac (RD breakdown)", content: "A recent paper looked at certified GF oats tolerance. TL;DR for most it's fine, but introduce slowly. Linking the study and my notes.", image: null },
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
      // some likes
      const likers = ["maya", "sara", "theo", "leo", "priya"].filter(() => Math.random() > 0.4);
      for (const l of likers) {
        await prisma.like.upsert({
          where: { postId_userId: { postId: post.id, userId: users[l].id } },
          update: {},
          create: { postId: post.id, userId: users[l].id },
        }).catch(() => {});
      }
      // a comment or two
      await prisma.comment.create({
        data: { postId: post.id, authorId: users["sara"].id, content: "This is so helpful, thank you for sharing 💛" },
      });
    }
  }

  // ----------------------------- Restaurants -----------------------------
  if ((await prisma.restaurant.count()) === 0) {
    const restaurants = [
      { name: "Mariposa Kitchen", city: "Austin", address: "1200 S Congress Ave", lat: 30.249, lng: -97.749, cuisine: "Mexican", priceLevel: 2, dedicatedFryer: true, separatePrepArea: true, dedicatedKitchen: true, certified: true, glutenFreeMenu: true, celiacSafe: true, delivery: true, staffTrainingLevel: "expert", communityConfidence: 92, img: "rest-mariposa", desc: "100% gluten-free kitchen with a dedicated fryer. A celiac safe haven." },
      { name: "Hearth & Sage", city: "Portland", address: "88 NW 23rd Ave", lat: 45.529, lng: -122.698, cuisine: "American", priceLevel: 3, dedicatedFryer: false, separatePrepArea: true, dedicatedKitchen: false, certified: false, glutenFreeMenu: true, celiacSafe: true, delivery: false, staffTrainingLevel: "trained", communityConfidence: 78, img: "rest-hearth", desc: "Farm-to-table with a thoughtful GF menu and trained staff." },
      { name: "Nonna's GF Trattoria", city: "Brooklyn", address: "455 Court St", lat: 40.678, lng: -73.999, cuisine: "Italian", priceLevel: 2, dedicatedFryer: true, separatePrepArea: true, dedicatedKitchen: true, certified: true, glutenFreeMenu: true, celiacSafe: true, delivery: true, staffTrainingLevel: "expert", communityConfidence: 95, img: "rest-nonna", desc: "Entirely gluten-free Italian. The pasta will make you cry." },
      { name: "Blue Lotus Thai", city: "San Francisco", address: "21 Valencia St", lat: 37.769, lng: -122.422, cuisine: "Thai", priceLevel: 2, dedicatedFryer: false, separatePrepArea: true, dedicatedKitchen: false, certified: false, glutenFreeMenu: true, celiacSafe: false, delivery: true, staffTrainingLevel: "basic", communityConfidence: 61, img: "rest-thai", desc: "Lots of GF options; ask about soy sauce and shared woks." },
      { name: "The Daily Grind", city: "Chicago", address: "900 W Randolph", lat: 41.884, lng: -87.651, cuisine: "Cafe", priceLevel: 1, dedicatedFryer: false, separatePrepArea: false, dedicatedKitchen: false, certified: false, glutenFreeMenu: false, celiacSafe: false, delivery: true, staffTrainingLevel: "none", communityConfidence: 38, img: "rest-cafe", desc: "Limited GF; cross-contamination risk is real here." },
      { name: "Coastline Poke", city: "Austin", address: "500 W 2nd St", lat: 30.266, lng: -97.752, cuisine: "Hawaiian", priceLevel: 2, dedicatedFryer: false, separatePrepArea: true, dedicatedKitchen: false, certified: false, glutenFreeMenu: true, celiacSafe: true, delivery: true, staffTrainingLevel: "trained", communityConfidence: 81, img: "rest-poke", desc: "Naturally GF-friendly bowls with clearly marked allergens." },
    ];
    for (const r of restaurants) {
      const created = await prisma.restaurant.create({
        data: {
          name: r.name, city: r.city, address: r.address, lat: r.lat, lng: r.lng, cuisine: r.cuisine,
          priceLevel: r.priceLevel, dedicatedFryer: r.dedicatedFryer, separatePrepArea: r.separatePrepArea,
          dedicatedKitchen: r.dedicatedKitchen, certified: r.certified, glutenFreeMenu: r.glutenFreeMenu,
          celiacSafe: r.celiacSafe, delivery: r.delivery, staffTrainingLevel: r.staffTrainingLevel,
          communityConfidence: r.communityConfidence, crossContaminationRisk: 100 - r.communityConfidence,
          imageUrl: img(r.img), description: r.desc,
        },
      });
      await prisma.restaurantReview.create({
        data: { restaurantId: created.id, userId: users["maya"].id, rating: Math.min(5, Math.round(r.communityConfidence / 20)), safetyRating: Math.min(5, Math.round(r.communityConfidence / 20)), content: r.celiacSafe ? "Felt safe the whole time, staff knew their stuff." : "Okay but I'd be careful — ask lots of questions." },
      });
      await prisma.restaurantReview.create({
        data: { restaurantId: created.id, userId: users["theo"].id, rating: Math.max(2, Math.round(r.communityConfidence / 22)), safetyRating: Math.max(2, Math.round(r.communityConfidence / 22)), content: "Solid GF options. Would return." },
      });
    }
  }

  // ----------------------------- Recipes -----------------------------
  if ((await prisma.recipe.count()) === 0) {
    const recipes = [
      { author: "maya", title: "5-Minute Banana Oat Pancakes", category: "Quick Meals", desc: "Fluffy, naturally gluten-free pancakes with just a few ingredients.", prep: 5, cook: 10, servings: 2, cal: 320, protein: 11, carbs: 52, fat: 7, img: "rec-pancakes", ingredients: ["2 ripe bananas", "2 eggs", "1 cup certified GF oats", "1 tsp baking powder", "Pinch of cinnamon"], steps: ["Blend all ingredients until smooth.", "Heat a non-stick pan over medium.", "Pour small rounds and cook 2 min per side.", "Serve with berries and maple syrup."] },
      { author: "nina", title: "High-Protein Quinoa Power Bowl", category: "High Protein", desc: "A satisfying, balanced bowl that meal-preps beautifully.", prep: 15, cook: 20, servings: 4, cal: 480, protein: 28, carbs: 45, fat: 18, img: "rec-quinoa", ingredients: ["1 cup quinoa", "1 can chickpeas", "2 cups spinach", "1 avocado", "Tahini-lemon dressing"], steps: ["Cook quinoa per package.", "Roast chickpeas at 400°F for 20 min.", "Assemble bowls with greens and avocado.", "Drizzle dressing and serve."] },
      { author: "leo", title: "Kid-Friendly GF Chicken Tenders", category: "Kids", desc: "Crispy tenders the whole family will fight over.", prep: 15, cook: 18, servings: 4, cal: 410, protein: 32, carbs: 22, fat: 19, img: "rec-tenders", ingredients: ["1 lb chicken tenders", "1 cup GF breadcrumbs", "2 eggs", "Paprika & garlic powder", "Olive oil spray"], steps: ["Set up egg and breadcrumb stations.", "Coat tenders, then spray with oil.", "Bake at 425°F for 18 min, flipping once.", "Serve with GF dipping sauce."] },
      { author: "sara", title: "No-Knead GF Sandwich Bread", category: "Baking", desc: "Soft, sliceable bread that actually tastes like bread.", prep: 20, cook: 50, servings: 10, cal: 180, protein: 4, carbs: 30, fat: 5, img: "rec-bread", ingredients: ["3 cups GF flour blend", "1 packet yeast", "2 tbsp psyllium husk", "1.5 cups warm water", "2 tbsp olive oil"], steps: ["Mix dry, then wet ingredients.", "Let rise 45 min in a loaf pan.", "Bake at 375°F for 50 min.", "Cool fully before slicing."] },
      { author: "theo", title: "15-Minute Veggie Pad Thai", category: "Vegan", desc: "Rice noodles, crunchy veg, and a tangy tamarind sauce.", prep: 10, cook: 10, servings: 3, cal: 390, protein: 12, carbs: 60, fat: 10, img: "rec-padthai", ingredients: ["8 oz rice noodles", "Tamarind paste", "Tamari (GF)", "Tofu", "Bean sprouts & peanuts"], steps: ["Soak noodles in hot water.", "Stir-fry tofu and veg.", "Add sauce and noodles, toss.", "Top with peanuts and lime."] },
      { author: "maya", title: "Budget GF Lentil Soup", category: "Budget", desc: "Hearty, cheap, and freezer-friendly.", prep: 10, cook: 30, servings: 6, cal: 260, protein: 15, carbs: 38, fat: 4, img: "rec-soup", ingredients: ["2 cups red lentils", "1 onion", "2 carrots", "GF veg stock", "Cumin & smoked paprika"], steps: ["Sauté onion and carrot.", "Add lentils, spices, and stock.", "Simmer 30 min.", "Blend half for creaminess."] },
    ];
    for (const r of recipes) {
      const created = await prisma.recipe.create({
        data: {
          authorId: users[r.author].id, title: r.title, description: r.desc, category: r.category,
          prepTime: r.prep, cookTime: r.cook, servings: r.servings, calories: r.cal, protein: r.protein,
          carbs: r.carbs, fat: r.fat, imageUrl: img(r.img), ingredients: r.ingredients, steps: r.steps,
        },
      });
      for (const [uname, rating, review] of [["sara", 5, "Made this twice already!"], ["theo", 4, "Great base recipe."], ["priya", 5, null]] as [string, number, string | null][]) {
        await prisma.recipeRating.upsert({
          where: { recipeId_userId: { recipeId: created.id, userId: users[uname].id } },
          update: {},
          create: { recipeId: created.id, userId: users[uname].id, rating, review },
        });
      }
    }
  }

  // ----------------------------- Products -----------------------------
  if ((await prisma.product.count()) === 0) {
    const products = [
      { name: "Artisan GF Sourdough", brand: "Loafly", category: "Bread & Bakery", ingredients: "Rice flour, psyllium, water, salt, yeast", safety: 95, certified: true, barcode: "0010000001", img: "prod-bread" },
      { name: "Sea Salt Rice Crackers", brand: "Crunchwell", category: "Snacks", ingredients: "Brown rice, sunflower oil, sea salt", safety: 90, certified: true, barcode: "0010000002", img: "prod-crackers" },
      { name: "Chickpea Fusilli", brand: "Bandita", category: "Pasta & Grains", ingredients: "Chickpea flour", safety: 88, certified: true, barcode: "0010000003", img: "prod-pasta" },
      { name: "Maple Almond Granola", brand: "Wildmorning", category: "Breakfast", ingredients: "GF oats, almonds, maple syrup", safety: 72, certified: false, barcode: "0010000004", img: "prod-granola" },
      { name: "Tamari Soy Sauce", brand: "Umami Co.", category: "Condiments", ingredients: "Water, soybeans, salt", safety: 84, certified: true, barcode: "0010000005", img: "prod-tamari" },
      { name: "All-Purpose Flour Blend", brand: "BakeFree", category: "Baking", ingredients: "Rice flour, tapioca starch, xanthan gum", safety: 91, certified: true, barcode: "0010000006", img: "prod-flour" },
    ];
    for (const p of products) {
      const created = await prisma.product.create({
        data: { name: p.name, brand: p.brand, category: p.category, ingredients: p.ingredients, safetyRating: p.safety, certified: p.certified, barcode: p.barcode, imageUrl: img(p.img) },
      });
      await prisma.productReview.create({ data: { productId: created.id, userId: users["sara"].id, rating: Math.round(p.safety / 20), content: p.safety > 80 ? "A staple in my pantry now." : "Decent but check the label each time." } });
    }
  }

  // ----------------------------- Events -----------------------------
  if ((await prisma.event.count()) === 0) {
    const events = [
      { title: "Austin GF Brunch Meetup", desc: "Casual brunch at a 100% GF spot. All welcome!", location: "Mariposa Kitchen", city: "Austin", lat: 30.249, lng: -97.749, type: "dinner", host: "maya", inDays: 5 },
      { title: "Newly Diagnosed Support Circle", desc: "A gentle, moderated circle for those recently diagnosed.", location: "Community Center", city: "Brooklyn", lat: 40.678, lng: -73.99, type: "support-circle", host: "priya", inDays: 9 },
      { title: "Parents of Celiac Kids Picnic", desc: "Bring the family — safe snacks provided.", location: "Laurelhurst Park", city: "Portland", lat: 45.522, lng: -122.626, type: "meetup", host: "leo", inDays: 14 },
    ];
    for (const e of events) {
      const created = await prisma.event.create({
        data: { title: e.title, description: e.desc, location: e.location, city: e.city, lat: e.lat, lng: e.lng, type: e.type, hostId: users[e.host].id, startsAt: new Date(Date.now() + e.inDays * 86400_000) },
      });
      for (const uname of ["maya", "theo", "sara"]) {
        await prisma.eventAttendee.upsert({
          where: { eventId_userId: { eventId: created.id, userId: users[uname].id } },
          update: {},
          create: { eventId: created.id, userId: users[uname].id },
        });
      }
    }
  }

  // ----------------------------- Articles / Knowledge -----------------------------
  if ((await prisma.article.count()) === 0) {
    const articles = [
      { author: "drchen", title: "Celiac Disease Basics: What's Actually Happening", category: "basics", type: "article", img: "art-basics", content: "Celiac disease is an autoimmune condition where ingesting gluten damages the small intestine. This is not an allergy or intolerance — it's an immune response. Here's what the science says and why even small amounts matter…" },
      { author: "drchen", title: "Your First 30 Days After Diagnosis", category: "newly-diagnosed", type: "article", img: "art-30days", content: "The first month can feel overwhelming. Start by cleaning out obvious gluten, set up a separate toaster, and read every label. Here's a week-by-week plan to reduce the overwhelm…" },
      { author: "nina", title: "Common Nutritional Deficiencies in Celiac Disease", category: "deficiencies", type: "article", img: "art-nutrition", content: "Iron, B12, vitamin D, calcium, and folate are commonly low at diagnosis. Here's how to work with your care team to monitor and replenish them safely…" },
      { author: "drchen", title: "Long-Term Management & Follow-Up Care", category: "long-term", type: "webinar", img: "art-longterm", content: "Annual follow-ups, antibody monitoring, and bone density matter for the long haul. In this webinar we cover what good ongoing care looks like…" },
      { author: "nina", title: "Pediatric Celiac: Helping Kids Thrive", category: "pediatric", type: "article", img: "art-kids", content: "Children with celiac can absolutely thrive. From school accommodations to birthday parties, here's a practical, compassionate guide for families…" },
      { author: "drchen", title: "Celiac & Family Planning", category: "family-planning", type: "article", img: "art-family", content: "Managing celiac before and during pregnancy supports better outcomes. Here's what current guidance recommends…" },
    ];
    for (const a of articles) {
      await prisma.article.create({
        data: { authorId: users[a.author].id, title: a.title, content: a.content, category: a.category, type: a.type, imageUrl: img(a.img) },
      });
    }
    await prisma.video.create({ data: { authorId: users["nina"].id, title: "Reading GF Labels in 90 Seconds", description: "A quick visual guide to spotting hidden gluten.", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" } });
  }

  // ----------------------------- Mental health resources -----------------------------
  if ((await prisma.mentalHealthResource.count()) === 0) {
    const res = [
      { title: "Calming the Eating-Out Spiral", category: "eating-out", type: "exercise", content: "A 4-step grounding exercise for when restaurant anxiety hits: breathe, plan, ask, and self-compassion." },
      { title: "When Diagnosis Feels Like Grief", category: "newly-diagnosed", type: "article", content: "Mourning your old relationship with food is normal. Naming the grief is the first step to moving through it." },
      { title: "Beating Social Isolation", category: "isolation", type: "article", content: "Practical scripts for navigating shared meals, plus how to find your people in the collective." },
      { title: "Anxiety Toolkit for Celiac Life", category: "anxiety", type: "exercise", content: "Box breathing, worry windows, and a 'safe foods' anchor list to reduce daily anxiety." },
      { title: "Finding a Gluten-Aware Therapist", category: "depression", type: "directory", content: "What to look for in a therapist who understands chronic illness, and questions to ask in a first session." },
    ];
    for (const r of res) await prisma.mentalHealthResource.create({ data: r });
  }

  // A couple of mood entries + journal for the demo user
  if ((await prisma.moodEntry.count({ where: { userId: users["maya"].id } })) === 0) {
    for (const [d, mood, note] of [[6, 3, "Tough day, glutened by accident."], [4, 4, "Cooked a great dinner at home."], [2, 5, "Found a safe restaurant!"], [0, 4, "Feeling hopeful."]] as [number, number, string][]) {
      await prisma.moodEntry.create({ data: { userId: users["maya"].id, mood, note, createdAt: new Date(Date.now() - d * 86400_000) } });
    }
    await prisma.journalEntry.create({ data: { userId: users["maya"].id, prompt: "What is one thing that went well today?", content: "I finally ate out without a stomachache. Small win, big feeling." } });
  }

  // Follows
  for (const [a, b] of [["priya", "maya"], ["priya", "nina"], ["sara", "maya"], ["theo", "maya"], ["leo", "drchen"]]) {
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: users[a].id, followingId: users[b].id } },
      update: {},
      create: { followerId: users[a].id, followingId: users[b].id },
    });
  }

  console.log("✅ Seed complete.");
  console.log("   Demo login → maya@glutenfree.dev / password123");
  console.log("   Admin login → admin@glutenfree.dev / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

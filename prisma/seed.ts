import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function main() {
  console.log("🔵 Seeding Circle…");
  const passwordHash = await bcrypt.hash("password123", 10);

  const usersData = [
    { email: "maya@circle.app", username: "maya", name: "Maya Patel", role: "USER", bio: "Diagnosed 2021. Sharing my safe-eating wins 🔵", location: "Austin, TX", isPremium: true, diagnosis: "celiac" },
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
        isPremium: u.isPremium ?? false,
        location: u.location,
      },
      create: {
        email: u.email,
        username: u.username,
        name: u.name,
        role: u.role,
        bio: u.bio,
        location: u.location,
        isPremium: u.isPremium ?? false,
        passwordHash,
        presence: u.username === "maya" || u.username === "sara" || u.username === "theo" ? "online" : "offline",
        lastSeen: new Date(),
        profile: { create: { diagnosis: u.diagnosis } },
        subscription: {
          create: {
            plan: u.isPremium ? "premium" : "free",
            status: u.isPremium ? "active" : "inactive",
          },
        },
      },
    });
    users[u.username] = { id: created.id };
  }

  // Community + Premium Lounge rooms
  const rooms = [
    { slug: "general-support", name: "General Support", description: "The main lounge — everyone welcome.", isPremium: false },
    { slug: "newly-diagnosed", name: "Newly Diagnosed", description: "Just starting out? We've got you.", isPremium: false },
    { slug: "parents", name: "Parents", description: "Raising celiac kids together.", isPremium: false },
    { slug: "teens", name: "Teens", description: "For younger members navigating GF life.", isPremium: false },
    { slug: "premium-lounge", name: "Premium Lounge", description: "Members-only circle for deeper support.", isPremium: true },
  ];
  const roomIds: Record<string, string> = {};
  for (const r of rooms) {
    const created = await prisma.chatRoom.upsert({
      where: { slug: r.slug },
      update: { name: r.name, description: r.description, isPremium: r.isPremium },
      create: { ...r, isCommunity: true },
    });
    roomIds[r.slug] = created.id;
  }

  // Join free rooms for everyone; premium lounge for premium users only
  for (const [uname, u] of Object.entries(users)) {
    const isPremium = usersData.find((x) => x.username === uname)?.isPremium;
    for (const r of rooms) {
      if (r.isPremium && !isPremium) continue;
      await prisma.chatRoomMember.upsert({
        where: { roomId_userId: { roomId: roomIds[r.slug], userId: u.id } },
        update: {},
        create: { roomId: roomIds[r.slug], userId: u.id },
      });
    }
  }

  if ((await prisma.message.count()) === 0) {
    const general = roomIds["general-support"];
    const convo: [string, string][] = [
      ["maya", "Morning everyone ☀️ Found a bakery with a dedicated GF kitchen yesterday — crying happy tears"],
      ["sara", "No way! Drop the details in the feed please 🙏"],
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
    await prisma.message.create({
      data: {
        roomId: roomIds["newly-diagnosed"],
        senderId: users["priya"].id,
        content: "Is cross-contamination really that big a deal at home if no one else is GF?",
        createdAt: new Date(Date.now() - 120000),
      },
    });
    await prisma.message.create({
      data: {
        roomId: roomIds["newly-diagnosed"],
        senderId: users["maya"].id,
        content: "Great question! Separate toaster + butter/condiments are the big ones. Happy to share a checklist 💛",
        createdAt: new Date(Date.now() - 60000),
      },
    });
    await prisma.message.create({
      data: {
        roomId: roomIds["premium-lounge"],
        senderId: users["maya"].id,
        content: "Welcome to the Premium Lounge — quieter circle, deeper chats. Glad you're here.",
        createdAt: new Date(Date.now() - 300000),
      },
    });
  }

  if ((await prisma.post.count()) === 0) {
    const posts = [
      { author: "maya", category: "restaurants", title: "Mariposa Kitchen is 100% celiac safe!", content: "Dedicated fryer, separate prep area, and the staff actually understood cross-contamination. First time in months I ate out without anxiety. Highly recommend 🌮", image: "post-mariposa" },
      { author: "priya", category: "newly-diagnosed", title: "Two weeks in — what do you wish you knew?", content: "Just diagnosed and my head is spinning. What are the non-obvious things I should watch out for? Sauces? Medications? Sending hugs to everyone here.", image: null },
      { author: "leo", category: "kids-with-celiac", title: "School lunch wins for celiac kids", content: "After a rough start, here's our rotation that my 7yo actually eats. Happy to share the full meal plan if anyone wants it!", image: "post-lunch" },
      { author: "sara", category: "product-reviews", title: "Best GF bread I've found (not even close)", content: "Tried 11 brands. This one toasts like real bread and doesn't crumble. Full ranking in the comments.", image: "post-bread" },
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
      const likers = ["maya", "sara", "theo", "leo", "priya"].filter(() => Math.random() > 0.4);
      for (const l of likers) {
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
  console.log("   Admin login → admin@circle.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

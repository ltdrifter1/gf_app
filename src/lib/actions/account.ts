"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { destroySession, requireUser } from "@/lib/auth";
import { zipSync, strToU8 } from "fflate";

export async function exportMyData() {
  const user = await requireUser();
  const [
    profile,
    posts,
    journal,
    moods,
    logs,
    costs,
    scans,
    messages,
  ] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.post.findMany({ where: { authorId: user.id } }),
    prisma.journalEntry.findMany({ where: { userId: user.id } }),
    prisma.moodEntry.findMany({ where: { userId: user.id } }),
    prisma.healthLog.findMany({ where: { userId: user.id } }),
    prisma.gfCostEntry.findMany({ where: { userId: user.id } }),
    prisma.labelScan.findMany({ where: { userId: user.id } }),
    prisma.message.findMany({
      where: { senderId: user.id },
      select: { id: true, content: true, createdAt: true, roomId: true },
      take: 2000,
    }),
  ]);

  const pack = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      location: user.location,
      bio: user.bio,
    },
    profile: profile
      ? {
          diagnosis: profile.diagnosis,
          journeyStage: profile.journeyStage,
          insightsOptIn: profile.insightsOptIn,
          // panicBuddyId omitted from export dump of other users; include as opaque id for the owner
          panicBuddyId: profile.panicBuddyId,
        }
      : null,
    posts: posts.map((p) => ({ id: p.id, title: p.title, content: p.content, createdAt: p.createdAt })),
    journal,
    moods,
    healthLogs: logs,
    costs,
    scans: scans.map((s) => ({
      id: s.id,
      source: s.source,
      verdict: s.verdict,
      createdAt: s.createdAt,
      preview: s.rawText.slice(0, 400),
    })),
    sentMessages: messages,
  };

  const costCsv = [
    "date,store,product,gf_price,regular_price,differential",
    ...costs.map((c) =>
      [
        c.purchasedAt.toISOString().slice(0, 10),
        JSON.stringify(c.store || ""),
        JSON.stringify(c.productName),
        c.gfPrice,
        c.regularPrice,
        Math.max(0, c.gfPrice - c.regularPrice),
      ].join(",")
    ),
  ].join("\n");

  const zipped = zipSync({
    "lumen-export.json": strToU8(JSON.stringify(pack, null, 2)),
    "gf-costs.csv": strToU8(costCsv),
    "README.txt": strToU8(
      "Your Lumen export. Health logs and journal are private. You file your own taxes; this is not legal advice.\n"
    ),
  });

  return {
    filename: `lumen-export-${user.username}.zip`,
    base64: Buffer.from(zipped).toString("base64"),
  };
}

export async function deleteMyAccount(formData: FormData) {
  const user = await requireUser();
  const confirm = String(formData.get("confirm") || "");
  if (confirm !== user.username) {
    return { error: `Type ${user.username} to confirm deletion.` };
  }
  await prisma.user.delete({ where: { id: user.id } });
  await destroySession();
  redirect("/");
}

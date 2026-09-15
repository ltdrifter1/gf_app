"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { isAllowedImageUrl } from "@/lib/safe-image";
import { rateLimit } from "@/lib/rate-limit";
import { blockedPairIds } from "@/lib/blocks";
import {
  clampOverlay,
  isAccentId,
  isBackgroundType,
  isFlairId,
  isThemeId,
  parseModuleOrder,
  sanitizeHexColor,
  sanitizeWallText,
  type ProfileModuleId,
} from "@/lib/profile-theme";

function revalidateProfile(username: string) {
  revalidatePath("/app/profile");
  revalidatePath("/app/profile/studio");
  revalidatePath(`/app/u/${username}`);
}

export async function saveProfileStudio(formData: FormData) {
  const user = await requireUser();
  const themeRaw = String(formData.get("themeId") || "lumen");
  const themeId = isThemeId(themeRaw) ? themeRaw : "lumen";
  const bgTypeRaw = String(formData.get("backgroundType") || "theme");
  const backgroundType = isBackgroundType(bgTypeRaw) ? bgTypeRaw : "theme";
  const backgroundColor = sanitizeHexColor(String(formData.get("backgroundColor") || ""));
  const coverRaw = String(formData.get("coverUrl") || "").trim();
  const bgUrlRaw = String(formData.get("backgroundUrl") || "").trim();
  if (coverRaw && !isAllowedImageUrl(coverRaw)) {
    return { error: "Cover photo must be an uploaded https image" };
  }
  if (bgUrlRaw && !isAllowedImageUrl(bgUrlRaw)) {
    return { error: "Background image must be an uploaded https image" };
  }
  const overlayOpacity = clampOverlay(Number(formData.get("overlayOpacity") || 35));
  const orderRaw = String(formData.get("moduleOrder") || "");
  let moduleOrder: ProfileModuleId[];
  try {
    moduleOrder = parseModuleOrder(orderRaw ? JSON.parse(orderRaw) : []);
  } catch {
    moduleOrder = parseModuleOrder([]);
  }
  const flairRaw = String(formData.get("nameFlair") || "default");
  const accentRaw = String(formData.get("nameAccent") || "brand");
  const nameFlair = isFlairId(flairRaw) ? flairRaw : "default";
  const nameAccent = isAccentId(accentRaw) ? accentRaw : "brand";

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      diagnosis: "unspecified",
      themeId,
      coverUrl: coverRaw || null,
      backgroundType,
      backgroundColor,
      backgroundUrl: bgUrlRaw || null,
      overlayOpacity,
      moduleOrder,
      nameFlair,
      nameAccent,
    },
    update: {
      themeId,
      coverUrl: coverRaw || null,
      backgroundType,
      backgroundColor,
      overlayOpacity,
      backgroundUrl: bgUrlRaw || null,
      moduleOrder,
      nameFlair,
      nameAccent,
    },
  });

  revalidateProfile(user.username);
  return { ok: true as const };
}

export async function saveTopEight(friendIds: string[]) {
  const user = await requireUser();
  const unique = [...new Set(friendIds)].slice(0, 8);
  if (unique.includes(user.id)) return { error: "You can't add yourself to Top 8" };

  const blocked = await blockedPairIds(user.id);
  const candidates = unique.filter((id) => !blocked.has(id));

  const allowed = await prisma.follow.findMany({
    where: {
      OR: [
        { followerId: user.id, followingId: { in: candidates } },
        { followerId: { in: candidates }, followingId: user.id },
      ],
    },
    select: { followerId: true, followingId: true },
  });
  const ok = new Set<string>();
  for (const f of allowed) {
    if (f.followerId === user.id) ok.add(f.followingId);
    if (f.followingId === user.id) ok.add(f.followerId);
  }
  const ranked = candidates.filter((id) => ok.has(id));

  await prisma.$transaction(async (tx) => {
    await tx.topEightFriend.deleteMany({ where: { ownerId: user.id } });
    if (ranked.length) {
      await tx.topEightFriend.createMany({
        data: ranked.map((friendId, i) => ({
          ownerId: user.id,
          friendId,
          position: i + 1,
        })),
      });
    }
  });

  revalidateProfile(user.username);
  return { ok: true as const, count: ranked.length };
}

export async function addWallComment(profileUserId: string, formData: FormData) {
  const user = await requireUser();
  const limited = await rateLimit(`wall:${user.id}`, 8, 60 * 60 * 1000);
  if (!limited.ok) {
    return { error: `Slow down a bit — try again in ${limited.retryAfterSec}s.` };
  }
  const content = sanitizeWallText(String(formData.get("content") || ""));
  if (content.length < 2) return { error: "Write a short note (plain text only)." };
  if (user.id === profileUserId) {
    // Owners can still leave a note on their own wall (classic MySpace).
  }

  const target = await prisma.user.findUnique({
    where: { id: profileUserId },
    select: { id: true, username: true },
  });
  if (!target) return { error: "That page isn't here." };

  const blocked = await blockedPairIds(user.id);
  if (blocked.has(profileUserId)) return { error: "You can't write on this wall." };

  await prisma.profileWallComment.create({
    data: { profileUserId, authorId: user.id, content },
  });
  revalidatePath(`/app/u/${target.username}`);
  revalidatePath("/app/profile");
  return { ok: true as const };
}

export async function deleteWallComment(commentId: string) {
  const user = await requireUser();
  const row = await prisma.profileWallComment.findUnique({
    where: { id: commentId },
    include: { profileUser: { select: { username: true } } },
  });
  if (!row) return { error: "Already gone." };
  if (row.profileUserId !== user.id && row.authorId !== user.id && user.role !== "ADMIN") {
    return { error: "Only the page owner can delete that." };
  }
  await prisma.profileWallComment.delete({ where: { id: commentId } });
  revalidatePath(`/app/u/${row.profileUser.username}`);
  revalidatePath("/app/profile");
  return { ok: true as const };
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function createPost(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const category = String(formData.get("category") || "newly-diagnosed");
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;

  if (!content && !title) return { error: "Write something to share" };

  // Title is optional; store it empty when omitted so the card doesn't
  // duplicate the body text as a heading.
  await prisma.post.create({
    data: {
      authorId: user.id,
      title,
      content: content || title,
      category,
      imageUrl,
    },
  });
  revalidatePath("/app");
  return { ok: true };
}

export async function toggleLike(postId: string) {
  const user = await requireUser();
  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { postId, userId: user.id } });
  }
  revalidatePath("/app");
  revalidatePath(`/app/post/${postId}`);
}

export async function toggleSave(postId: string) {
  const user = await requireUser();
  const existing = await prisma.savedPost.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });
  if (existing) {
    await prisma.savedPost.delete({ where: { id: existing.id } });
  } else {
    await prisma.savedPost.create({ data: { postId, userId: user.id } });
  }
  revalidatePath("/app");
  revalidatePath(`/app/post/${postId}`);
  revalidatePath("/app/saved");
}

export async function addComment(postId: string, formData: FormData) {
  const user = await requireUser();
  const content = String(formData.get("content") || "").trim();
  if (!content) return { error: "Comment can't be empty" };
  await prisma.comment.create({
    data: { postId, authorId: user.id, content },
  });
  revalidatePath(`/app/post/${postId}`);
  revalidatePath("/app");
  return { ok: true };
}

export async function toggleFollow(targetUserId: string) {
  const user = await requireUser();
  if (user.id === targetUserId) return;
  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId: targetUserId } },
  });
  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({ data: { followerId: user.id, followingId: targetUserId } });
  }
  revalidatePath("/app");
}

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { Avatar } from "./ui/avatar";
import { categoryBySlug } from "@/lib/constants";
import { timeAgo, cn } from "@/lib/utils";
import { toggleLike, toggleSave } from "@/lib/actions/posts";

export type PostCardData = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  category: string;
  createdAt: string;
  author: { name: string; username: string; avatarUrl: string | null; presence: string };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
};

export function PostCard({ post }: { post: PostCardData }) {
  const cat = categoryBySlug(post.category);
  const [liked, setLiked] = useState(post.likedByMe);
  const [saved, setSaved] = useState(post.savedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [, startTransition] = useTransition();

  function onLike() {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    startTransition(() => toggleLike(post.id));
  }
  function onSave() {
    setSaved((v) => !v);
    startTransition(() => toggleSave(post.id));
  }

  return (
    <article className="card p-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Avatar name={post.author.name} src={post.author.avatarUrl} size={42} presence={post.author.presence} />
        <div className="min-w-0">
          <p className="font-semibold text-sage-900 dark:text-white">{post.author.name}</p>
          <p className="text-xs text-sage-500 dark:text-sage-400">
            @{post.author.username} · {timeAgo(post.createdAt)}
          </p>
        </div>
        {cat && (
          <span className={cn("chip ml-auto", cat.color, "dark:bg-white/10 dark:text-sage-200")}>
            <span>{cat.emoji}</span>
            <span className="hidden sm:inline">{cat.label}</span>
          </span>
        )}
      </div>

      <Link href={`/app/post/${post.id}`} className="mt-3 block">
        {post.title && (
          <h3 className="font-display text-lg font-semibold text-sage-900 dark:text-white">{post.title}</h3>
        )}
        <p className="mt-1 whitespace-pre-wrap text-sage-700 dark:text-sage-200 line-clamp-6">{post.content}</p>
      </Link>

      {post.imageUrl && (
        <Link href={`/app/post/${post.id}`} className="mt-3 block overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imageUrl} alt="" className="max-h-96 w-full object-cover transition hover:scale-[1.02]" />
        </Link>
      )}

      <div className="mt-4 flex items-center gap-1 border-t border-white/40 dark:border-white/10 pt-3">
        <button
          onClick={onLike}
          className={cn(
            "btn-ghost gap-1.5 text-sm",
            liked && "text-rose-500"
          )}
        >
          <Heart className={cn("h-[18px] w-[18px]", liked && "fill-rose-500")} />
          {likeCount}
        </button>
        <Link href={`/app/post/${post.id}`} className="btn-ghost gap-1.5 text-sm">
          <MessageCircle className="h-[18px] w-[18px]" />
          {post.commentCount}
        </Link>
        <button
          onClick={onSave}
          className={cn("btn-ghost gap-1.5 text-sm ml-auto", saved && "text-brand-600")}
        >
          <Bookmark className={cn("h-[18px] w-[18px]", saved && "fill-brand-600")} />
          <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
        </button>
        <button className="btn-ghost gap-1.5 text-sm">
          <Share2 className="h-[18px] w-[18px]" />
        </button>
      </div>
    </article>
  );
}

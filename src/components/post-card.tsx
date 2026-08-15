"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Heart, MessageCircle, Bookmark, Share2, Check } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
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
  async function onShare() {
    const url = `${window.location.origin}/app/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title || "Safely post", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <article className="card p-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/app/u/${post.author.username}`}>
          <Avatar
            name={post.author.name}
            src={post.author.avatarUrl}
            size={42}
            presence={post.author.presence}
          />
        </Link>
        <div className="min-w-0">
          <Link
            href={`/app/u/${post.author.username}`}
            className="font-semibold text-sage-900 hover:underline dark:text-white"
          >
            {post.author.name}
          </Link>
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
          <h3 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
            {post.title}
          </h3>
        )}
        <p className="mt-1 line-clamp-6 whitespace-pre-wrap text-sage-700 dark:text-sage-200">
          {post.content}
        </p>
      </Link>

      {post.imageUrl && (
        <Link href={`/app/post/${post.id}`} className="mt-3 block overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt=""
            className="max-h-96 w-full object-cover transition hover:scale-[1.02]"
          />
        </Link>
      )}

      <div className="mt-4 flex items-center gap-1 border-t border-white/40 pt-3 dark:border-white/10">
        <button
          onClick={onLike}
          className={cn("btn-ghost gap-1.5 text-sm", liked && "text-rose-500")}
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
          className={cn("btn-ghost ml-auto gap-1.5 text-sm", saved && "text-brand-600")}
        >
          <Bookmark className={cn("h-[18px] w-[18px]", saved && "fill-brand-600")} />
          <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
        </button>
        <button onClick={onShare} className="btn-ghost gap-1.5 text-sm" title="Share">
          {copied ? (
            <Check className="h-[18px] w-[18px] text-emerald-500" />
          ) : (
            <Share2 className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>
    </article>
  );
}

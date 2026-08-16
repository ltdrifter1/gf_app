"use client";

import { useState, useTransition } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { POST_CATEGORIES } from "@/lib/constants";
import { createPost } from "@/lib/actions/posts";
import { Avatar } from "./ui/avatar";

export function PostComposer({ user }: { user: { name: string; avatarUrl: string | null } }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>(POST_CATEGORIES[0].slug);
  const [imageUrl, setImageUrl] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function onSubmit(formData: FormData) {
    formData.set("category", category);
    if (imageUrl) formData.set("imageUrl", imageUrl);
    startTransition(async () => {
      const res = await createPost(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setError("");
      setOpen(false);
      setImageUrl("");
      const form = document.getElementById("composer-form") as HTMLFormElement | null;
      form?.reset();
    });
  }

  return (
    <div className="rounded-[1.5rem] bg-white p-4 shadow-[0_2px_16px_-6px_rgba(15,118,110,0.14)] ring-1 ring-black/[0.04] dark:bg-white/[0.05] dark:ring-white/10">
      <div className="flex items-center gap-3">
        <Avatar name={user.name} src={user.avatarUrl} size={42} />
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="flex-1 rounded-full bg-[#F2F4F3] px-4 py-3 text-left text-sage-500 transition hover:bg-[#E8EEEC] dark:bg-white/5 dark:text-sage-400 dark:hover:bg-white/10"
          >
            Share an experience, ask a question…
          </button>
        ) : (
          <p className="font-semibold text-sage-900 dark:text-white">Create a post</p>
        )}
        {open && (
          <button onClick={() => setOpen(false)} className="ml-auto btn-ghost p-2">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <form id="composer-form" action={onSubmit} className="mt-4 space-y-3">
          <input name="title" className="input font-medium" placeholder="Title (optional)" />
          <textarea
            name="content"
            required
            rows={4}
            className="input resize-none"
            placeholder="What would you like to share with the community?"
          />
          {imageUrl && (
            <div className="relative overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="preview" className="max-h-64 w-full object-cover" />
              <button type="button" onClick={() => setImageUrl("")} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {POST_CATEGORIES.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCategory(c.slug)}
                className={`chip border transition ${
                  category === c.slug
                    ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                    : "border-transparent bg-sage-100/60 text-sage-600 dark:bg-white/5 dark:text-sage-300"
                }`}
              >
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex items-center justify-between">
            <label className="btn-ghost cursor-pointer text-sm">
              <ImagePlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add image URL</span>
              <input
                type="url"
                placeholder="Paste image URL"
                className="ml-2 w-40 rounded-lg bg-transparent text-xs outline-none placeholder:text-sage-400"
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </label>
            <button type="submit" disabled={pending} className="btn-primary">
              <Send className="h-4 w-4" />
              {pending ? "Posting…" : "Post"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

"use client";

import { useRef, useTransition } from "react";
import { Send } from "lucide-react";
import { addComment } from "@/lib/actions/posts";
import { Avatar } from "./ui/avatar";

export function CommentForm({
  postId,
  user,
}: {
  postId: string;
  user: { name: string; avatarUrl: string | null };
}) {
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      await addComment(postId, formData);
      ref.current?.reset();
    });
  }

  return (
    <form ref={ref} action={onSubmit} className="flex items-center gap-3">
      <Avatar name={user.name} src={user.avatarUrl} size={38} />
      <input name="content" required placeholder="Add a supportive comment…" className="input flex-1" />
      <button type="submit" disabled={pending} className="btn-primary px-4">
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}

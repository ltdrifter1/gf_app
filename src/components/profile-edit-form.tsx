"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { updateProfile, setPresence } from "@/lib/actions/profile";
import { Avatar } from "@/components/ui/avatar";

export function ProfileEditForm({
  initial,
  username,
}: {
  initial: {
    name: string;
    bio: string;
    location: string;
    diagnosis: string;
    avatarUrl: string;
    presence: string;
  };
  username: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [presence, setPresenceLocal] = useState(initial.presence);
  const [avatarPreview, setAvatarPreview] = useState(initial.avatarUrl);

  if (!open) {
    return (
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={() => setOpen(true)}>
          Edit profile
        </button>
        <Link href={`/app/u/${username}`} className="btn-ghost">
          <ExternalLink className="h-4 w-4" />
          View public profile
        </Link>
      </div>
    );
  }

  return (
    <form
      className="mt-5 space-y-3 rounded-2xl border border-white/50 bg-white/50 p-4 dark:border-white/10 dark:bg-white/5"
      action={(fd) => {
        setError(null);
        setSaved(false);
        start(async () => {
          const r = await updateProfile(fd);
          if (r?.error) setError(r.error);
          else {
            setSaved(true);
            setTimeout(() => setOpen(false), 600);
          }
        });
      }}
    >
      <div className="flex items-center gap-3">
        <Avatar
          name={initial.name}
          src={avatarPreview || null}
          size={56}
          presence={presence}
        />
        <div className="min-w-0 flex-1">
          <label className="text-xs font-medium text-sage-500">Avatar URL</label>
          <input
            name="avatarUrl"
            defaultValue={initial.avatarUrl}
            placeholder="https://…"
            className="input mt-1"
            onChange={(e) => setAvatarPreview(e.target.value.trim())}
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-sage-500">Name</label>
        <input name="name" defaultValue={initial.name} className="input mt-1" required />
      </div>
      <div>
        <label className="text-xs font-medium text-sage-500">Bio</label>
        <textarea name="bio" defaultValue={initial.bio} rows={3} className="input mt-1" />
      </div>
      <div>
        <label className="text-xs font-medium text-sage-500">Location</label>
        <input name="location" defaultValue={initial.location} className="input mt-1" />
      </div>
      <div>
        <label className="text-xs font-medium text-sage-500">Diagnosis</label>
        <select name="diagnosis" defaultValue={initial.diagnosis} className="input mt-1">
          <option value="unspecified">Prefer not to say</option>
          <option value="celiac">Celiac disease</option>
          <option value="gluten-intolerance">Gluten intolerance</option>
          <option value="supporter">Supporter / family</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-sage-500">Messenger presence</label>
        <div className="mt-1 flex gap-2">
          {(["online", "away", "offline"] as const).map((p) => (
            <button
              key={p}
              type="button"
              disabled={pending}
              className={`chip capitalize ${
                presence === p
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                  : "bg-white/60 text-sage-600 dark:bg-white/5"
              }`}
              onClick={() =>
                start(async () => {
                  setPresenceLocal(p);
                  await setPresence(p);
                })
              }
            >
              {p}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-sage-400">
          Offline sticks until you set Online. Away auto-applies when you leave the tab.
        </p>
      </div>
      {error && <p className="text-sm text-rose-500">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : null}
          Save
        </button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

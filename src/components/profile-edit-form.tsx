"use client";

import { useState, useTransition } from "react";
import { Loader2, Check } from "lucide-react";
import { updateProfile, setPresence } from "@/lib/actions/profile";

export function ProfileEditForm({
  initial,
}: {
  initial: {
    name: string;
    bio: string;
    location: string;
    diagnosis: string;
    avatarUrl: string;
    presence: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!open) {
    return (
      <button type="button" className="btn-secondary mt-5" onClick={() => setOpen(true)}>
        Edit profile
      </button>
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
            setOpen(false);
          }
        });
      }}
    >
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
        <label className="text-xs font-medium text-sage-500">Avatar URL</label>
        <input
          name="avatarUrl"
          defaultValue={initial.avatarUrl}
          placeholder="https://…"
          className="input mt-1"
        />
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
        <label className="text-xs font-medium text-sage-500">Presence</label>
        <div className="mt-1 flex gap-2">
          {(["online", "away", "offline"] as const).map((p) => (
            <button
              key={p}
              type="button"
              className={`chip capitalize ${
                initial.presence === p
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                  : "bg-white/60 text-sage-600 dark:bg-white/5"
              }`}
              onClick={() =>
                start(async () => {
                  await setPresence(p);
                })
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-rose-500">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
          Save
        </button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

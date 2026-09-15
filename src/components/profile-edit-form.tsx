"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import { updateProfile, setPresence } from "@/lib/actions/profile";
import { Avatar } from "@/components/ui/avatar";
import { JOURNEY_STAGES } from "@/lib/constants";
import { PRESENCE_STATUSES, presenceLabel } from "@/lib/presence";
import { ImageUpload } from "@/components/image-upload";

export function ProfileEditForm({
  initial,
  username,
}: {
  initial: {
    name: string;
    bio: string;
    location: string;
    diagnosis: string;
    journeyStage: string;
    avatarUrl: string;
    presence: string;
    mood: string;
    likeToMeet: string;
    interests: string;
    insightsOptIn?: boolean;
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
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => setOpen(true)}>
          Edit Profile
        </button>
        <Link href={`/app/u/${username}`} className="btn-ghost w-full sm:w-auto">
          <ExternalLink className="h-4 w-4" />
          View as others see you
        </Link>
        <Link href="/app/profile/studio" className="btn-primary w-full sm:w-auto">
          <Sparkles className="h-4 w-4" />
          Profile Studio
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-3 rounded-2xl border border-white/50 bg-white/50 p-3 dark:border-white/10 dark:bg-white/5"
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
          className="rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <label className="text-xs font-medium text-sage-500">Avatar</label>
          <input type="hidden" name="avatarUrl" value={avatarPreview} />
          <ImageUpload
            name="avatarUpload"
            folder="avatars"
            value={avatarPreview}
            onChange={(url) => setAvatarPreview(url)}
            label="Upload photo"
          />
          <details className="mt-1">
            <summary className="cursor-pointer text-[11px] text-sage-400">Paste an https URL instead</summary>
            <input
              className="input mt-1 text-xs"
              placeholder="https://…"
              value={avatarPreview}
              onChange={(e) => setAvatarPreview(e.target.value)}
            />
          </details>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-sage-500">Name</label>
        <input name="name" defaultValue={initial.name} className="input mt-1" required />
      </div>
      <div>
        <label className="text-xs font-medium text-sage-500">Mood</label>
        <input
          name="mood"
          defaultValue={initial.mood}
          maxLength={80}
          placeholder="feeling safe after a dedicated kitchen win"
          className="input mt-1"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-sage-500">About me</label>
        <textarea name="bio" defaultValue={initial.bio} rows={3} className="input mt-1" />
      </div>
      <div>
        <label className="text-xs font-medium text-sage-500">I&apos;d like to meet</label>
        <textarea
          name="likeToMeet"
          defaultValue={initial.likeToMeet}
          rows={2}
          placeholder="Newly diagnosed folks, GF bakers, travel buddies…"
          className="input mt-1"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-sage-500">Interests</label>
        <textarea
          name="interests"
          defaultValue={initial.interests}
          rows={2}
          placeholder="Safe dining, GF baking, messenger late-nights"
          className="input mt-1"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-sage-500">Location</label>
        <input name="location" defaultValue={initial.location} className="input mt-1" />
      </div>
      <div>
        <label className="text-xs font-medium text-sage-500">Where you are in your journey</label>
        <select
          name="journeyStage"
          defaultValue={initial.journeyStage || "newly-diagnosed"}
          className="input mt-1"
        >
          {JOURNEY_STAGES.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-sage-400">
          Tailors private journal prompts on Journal.
        </p>
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
        <div className="mt-1 flex flex-wrap gap-2">
          {PRESENCE_STATUSES.map((s) => (
            <button
              key={s.slug}
              type="button"
              disabled={pending}
              className={`chip ${
                presence === s.slug
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                  : "bg-white/60 text-sage-600 dark:bg-white/5"
              }`}
              onClick={() =>
                start(async () => {
                  setPresenceLocal(s.slug);
                  await setPresence(s.slug);
                })
              }
            >
              {presenceLabel(s.slug)}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-sage-700 dark:text-sage-200">
        <input type="checkbox" name="insightsOptIn" defaultChecked={initial.insightsOptIn} />
        Opt in to private pattern insights (Health / Journal only)
      </label>
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

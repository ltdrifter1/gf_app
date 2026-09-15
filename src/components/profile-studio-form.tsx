"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, GripVertical, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/image-upload";
import { Avatar } from "@/components/ui/avatar";
import {
  BACKGROUND_TYPES,
  NAME_ACCENTS,
  NAME_FLAIRS,
  PROFILE_MODULES,
  PROFILE_THEMES,
  PROFILE_THEME_IDS,
  parseModuleOrder,
  type ProfileModuleId,
  type StudioLook,
} from "@/lib/profile-theme";
import { saveProfileStudio, saveTopEight } from "@/lib/actions/studio";

type FriendOpt = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
};

export function ProfileStudioForm({
  look,
  friends,
  topEightIds,
  username,
}: {
  look: StudioLook;
  friends: FriendOpt[];
  topEightIds: string[];
  username: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [themeId, setThemeId] = useState(look.themeId);
  const [backgroundType, setBackgroundType] = useState(look.backgroundType);
  const [backgroundColor, setBackgroundColor] = useState(look.backgroundColor || "#0d9488");
  const [coverUrl, setCoverUrl] = useState(look.coverUrl || "");
  const [backgroundUrl, setBackgroundUrl] = useState(look.backgroundUrl || "");
  const [overlayOpacity, setOverlayOpacity] = useState(look.overlayOpacity);
  const [moduleOrder, setModuleOrder] = useState<ProfileModuleId[]>(parseModuleOrder(look.moduleOrder));
  const [nameFlair, setNameFlair] = useState(look.nameFlair);
  const [nameAccent, setNameAccent] = useState(look.nameAccent);
  const [top8, setTop8] = useState<string[]>(topEightIds);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const friendMap = useMemo(() => new Map(friends.map((f) => [f.id, f])), [friends]);

  function moveModule(from: number, to: number) {
    if (to < 0 || to >= moduleOrder.length) return;
    setModuleOrder((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function toggleFriend(id: string) {
    setTop8((ids) => {
      if (ids.includes(id)) return ids.filter((x) => x !== id);
      if (ids.length >= 8) return ids;
      return [...ids, id];
    });
  }

  function moveFriend(from: number, to: number) {
    if (to < 0 || to >= top8.length) return;
    setTop8((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  return (
    <form
      className="space-y-6"
      action={(fd) => {
        fd.set("themeId", themeId);
        fd.set("backgroundType", backgroundType);
        fd.set("backgroundColor", backgroundColor);
        fd.set("coverUrl", coverUrl);
        fd.set("backgroundUrl", backgroundUrl);
        fd.set("overlayOpacity", String(overlayOpacity));
        fd.set("moduleOrder", JSON.stringify(moduleOrder));
        fd.set("nameFlair", nameFlair);
        fd.set("nameAccent", nameAccent);
        setError(null);
        setSaved(false);
        start(async () => {
          const lookRes = await saveProfileStudio(fd);
          const eightRes = await saveTopEight(top8);
          if (lookRes && "error" in lookRes && lookRes.error) {
            setError(lookRes.error);
            return;
          }
          if (eightRes && "error" in eightRes && eightRes.error) {
            setError(eightRes.error);
            return;
          }
          setSaved(true);
        });
      }}
    >
      <section className="card space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-sage-900 dark:text-white">
          <Sparkles className="h-4 w-4" /> Theme packs
        </h2>
        <p className="text-sm text-sage-500">Six Y2K skins plus Lumen glass. Dark mode gets its own tokens so nothing blows out.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PROFILE_THEME_IDS.map((id) => {
            const t = PROFILE_THEMES[id];
            const on = themeId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setThemeId(id)}
                className={`rounded-2xl border p-3 text-left transition ${
                  on
                    ? "border-brand-400 ring-2 ring-brand-300/50"
                    : "border-white/50 hover:border-brand-200 dark:border-white/10"
                }`}
              >
                <span
                  className="mb-2 block h-8 rounded-lg"
                  style={{ background: `linear-gradient(90deg, ${t.vars.sectionFrom}, ${t.vars.sectionTo})` }}
                />
                <p className="text-sm font-semibold text-sage-900 dark:text-white">{t.name}</p>
                <p className="mt-0.5 text-[11px] text-sage-500">{t.blurb}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-display text-lg font-bold text-sage-900 dark:text-white">Photos</h2>
        <p className="text-sm text-sage-500">
          Upload is the main path (Vercel Blob when configured, otherwise local files). URL paste is still here if you need it.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-sage-500">Cover / wallpaper strip</p>
            <ImageUpload name="coverUpload" folder="covers" value={coverUrl} onChange={setCoverUrl} label="Upload cover" />
            <input
              className="input mt-2 text-xs"
              placeholder="https://… (advanced)"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-sage-500">Page background image</p>
            <ImageUpload
              name="bgUpload"
              folder="covers"
              value={backgroundUrl}
              onChange={(url) => {
                setBackgroundUrl(url);
                setBackgroundType("image");
              }}
              label="Upload background"
            />
            <input
              className="input mt-2 text-xs"
              placeholder="https://… (advanced)"
              value={backgroundUrl}
              onChange={(e) => setBackgroundUrl(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-display text-lg font-bold text-sage-900 dark:text-white">Custom background</h2>
        <div className="flex flex-wrap gap-2">
          {BACKGROUND_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setBackgroundType(t)}
              className={`chip border capitalize ${
                backgroundType === t
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-transparent bg-white/60 text-sage-600 dark:bg-white/5"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {(backgroundType === "solid" || backgroundType === "gradient") && (
          <label className="flex items-center gap-3 text-sm">
            Colour
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-white/50 bg-transparent"
            />
            <code className="text-xs text-sage-500">{backgroundColor}</code>
          </label>
        )}
        {(backgroundType === "image" || coverUrl) && (
          <label className="block text-sm">
            Overlay {overlayOpacity}%
            <input
              type="range"
              min={0}
              max={80}
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </label>
        )}
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-display text-lg font-bold text-sage-900 dark:text-white">Name flair</h2>
        <p className="text-sm text-sage-500">Safe presets only — no custom CSS.</p>
        <div className="flex flex-wrap gap-2">
          {NAME_FLAIRS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setNameFlair(f.id)}
              className={`chip border ${
                nameFlair === f.id
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-transparent bg-white/60 dark:bg-white/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {NAME_ACCENTS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setNameAccent(a.id)}
              className={`chip border ${
                nameAccent === a.id
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-transparent bg-white/60 dark:bg-white/5"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-display text-lg font-bold text-sage-900 dark:text-white">Module order</h2>
        <p className="text-sm text-sage-500">Pic and blurbs stay on the left; the rest stack on the right. Drag or use the arrows.</p>
        <ol className="space-y-1">
          {moduleOrder.map((id, i) => {
            const meta = PROFILE_MODULES.find((m) => m.id === id)!;
            return (
              <li
                key={id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex == null) return;
                  moveModule(dragIndex, i);
                  setDragIndex(null);
                }}
                className="flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2 text-sm dark:bg-white/5"
              >
                <GripVertical className="h-4 w-4 text-sage-400" />
                <span className="flex-1 font-medium">{meta.label}</span>
                <span className="text-[10px] uppercase text-sage-400">{meta.column}</span>
                <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => moveModule(i, i - 1)}>
                  Up
                </button>
                <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => moveModule(i, i + 1)}>
                  Down
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-display text-lg font-bold text-sage-900 dark:text-white">Top 8</h2>
        <p className="text-sm text-sage-500">
          Explicit list — not “last eight follows.” Pick up to eight people you follow (or who follow you), then drag to rank.
        </p>
        {friends.length === 0 ? (
          <p className="text-sm text-sage-500">Follow someone first, then they’ll show up here.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {friends.map((f) => {
              const on = top8.includes(f.id);
              const rank = on ? top8.indexOf(f.id) + 1 : null;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFriend(f.id)}
                  className={`flex items-center gap-2 rounded-xl border px-2 py-2 text-left ${
                    on ? "border-brand-300 bg-brand-50/80" : "border-white/50 bg-white/40 dark:border-white/10"
                  }`}
                >
                  <Avatar name={f.name} src={f.avatarUrl} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{f.name}</span>
                    <span className="text-xs text-sage-500">@{f.username}</span>
                  </span>
                  {rank ? <span className="text-xs font-bold text-brand-700">#{rank}</span> : null}
                </button>
              );
            })}
          </div>
        )}
        {top8.length > 0 && (
          <ol className="space-y-1">
            {top8.map((id, i) => {
              const f = friendMap.get(id);
              if (!f) return null;
              return (
                <li key={id} className="flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2 text-sm dark:bg-white/5">
                  <span className="w-6 text-xs font-bold text-sage-400">#{i + 1}</span>
                  <span className="flex-1">{f.name}</span>
                  <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => moveFriend(i, i - 1)}>
                    Up
                  </button>
                  <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => moveFriend(i, i + 1)}>
                    Down
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
          {saved ? "Saved" : "Save Profile Studio"}
        </button>
        <Link href={`/app/u/${username}`} className="btn-secondary">
          View your page
        </Link>
      </div>
    </form>
  );
}

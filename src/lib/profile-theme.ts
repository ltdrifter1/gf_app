export const PROFILE_THEME_IDS = [
  "lumen",
  "classic-blue",
  "pink-glitter",
  "lime",
  "midnight",
  "sunflower",
  "ocean",
] as const;
export type ProfileThemeId = (typeof PROFILE_THEME_IDS)[number];

export const PROFILE_MODULES = [
  { id: "pic", label: "Profile pic", column: "side" as const },
  { id: "blurbs", label: "Blurbs", column: "side" as const },
  { id: "blog", label: "Blog", column: "main" as const },
  { id: "friends", label: "Friend Space", column: "main" as const },
  { id: "recipes", label: "Recipes", column: "main" as const },
  { id: "dining", label: "Dining", column: "main" as const },
  { id: "wall", label: "Guestbook", column: "main" as const },
] as const;
export type ProfileModuleId = (typeof PROFILE_MODULES)[number]["id"];
export const DEFAULT_MODULE_ORDER: ProfileModuleId[] = PROFILE_MODULES.map((m) => m.id);

export const NAME_FLAIRS = [
  { id: "default", label: "Lumen" },
  { id: "display", label: "Headline" },
  { id: "typewriter", label: "Typewriter" },
  { id: "comic", label: "Comic" },
  { id: "hand", label: "Handwritten" },
  { id: "groovy", label: "Groovy" },
] as const;
export type NameFlairId = (typeof NAME_FLAIRS)[number]["id"];

export const NAME_ACCENTS = [
  { id: "brand", label: "Teal" },
  { id: "pink", label: "Hot pink" },
  { id: "lime", label: "Lime" },
  { id: "gold", label: "Gold" },
  { id: "ice", label: "Ice" },
  { id: "grape", label: "Grape" },
] as const;
export type NameAccentId = (typeof NAME_ACCENTS)[number]["id"];

export const BACKGROUND_TYPES = ["theme", "solid", "gradient", "image"] as const;
export type BackgroundType = (typeof BACKGROUND_TYPES)[number];

export type ProfileTheme = {
  id: ProfileThemeId;
  name: string;
  blurb: string;
  glitter?: boolean;
  vars: {
    bg: string;
    bgDark: string;
    sectionFrom: string;
    sectionTo: string;
    sectionFromDark: string;
    sectionToDark: string;
    panel: string;
    panelDark: string;
    border: string;
    borderDark: string;
    text: string;
    textDark: string;
    muted: string;
    mutedDark: string;
    accent: string;
    accentDark: string;
  };
};

export const PROFILE_THEMES: Record<ProfileThemeId, ProfileTheme> = {
  lumen: {
    id: "lumen",
    name: "Lumen glass",
    blurb: "The default — frosted teal, same as the rest of the app.",
    vars: {
      bg: "transparent",
      bgDark: "transparent",
      sectionFrom: "#0d9488",
      sectionTo: "#0284c8",
      sectionFromDark: "#0f766e",
      sectionToDark: "#0369a1",
      panel: "rgba(255,255,255,0.55)",
      panelDark: "rgba(255,255,255,0.04)",
      border: "rgba(255,255,255,0.5)",
      borderDark: "rgba(255,255,255,0.1)",
      text: "#22372c",
      textDark: "#e3ede6",
      muted: "#4f8163",
      mutedDark: "#9fc0aa",
      accent: "#0d9488",
      accentDark: "#5eead4",
    },
  },
  "classic-blue": {
    id: "classic-blue",
    name: "Classic blue",
    blurb: "Silver chrome, navy headers — the 2006 default, kinder.",
    vars: {
      bg: "linear-gradient(180deg, #d6e4f5 0%, #f4f7fb 40%, #c9d9ee 100%)",
      bgDark: "linear-gradient(180deg, #152238 0%, #0e1728 100%)",
      sectionFrom: "#2455c3",
      sectionTo: "#163a8a",
      sectionFromDark: "#3d6fe0",
      sectionToDark: "#1d4ed8",
      panel: "rgba(255,255,255,0.78)",
      panelDark: "rgba(20,32,54,0.82)",
      border: "rgba(36,85,195,0.25)",
      borderDark: "rgba(125,168,255,0.25)",
      text: "#1a2a4a",
      textDark: "#e8eef8",
      muted: "#4a6288",
      mutedDark: "#9db4d6",
      accent: "#2455c3",
      accentDark: "#93c5fd",
    },
  },
  "pink-glitter": {
    id: "pink-glitter",
    name: "Pink glitter",
    blurb: "Hot-pink headers and a little sparkle. Extra.",
    glitter: true,
    vars: {
      bg: "linear-gradient(180deg, #ffe4f1 0%, #fff5fb 45%, #ffd6ec 100%)",
      bgDark: "linear-gradient(180deg, #3b1024 0%, #1a0a12 100%)",
      sectionFrom: "#db2777",
      sectionTo: "#f472b6",
      sectionFromDark: "#f472b6",
      sectionToDark: "#9d174d",
      panel: "rgba(255,255,255,0.8)",
      panelDark: "rgba(55,16,36,0.78)",
      border: "rgba(219,39,119,0.28)",
      borderDark: "rgba(244,114,182,0.28)",
      text: "#831843",
      textDark: "#fce7f3",
      muted: "#9d174d",
      mutedDark: "#f9a8d4",
      accent: "#db2777",
      accentDark: "#f9a8d4",
    },
  },
  lime: {
    id: "lime",
    name: "Lime",
    blurb: "Acid green chrome. Very 2004 messenger away-message.",
    vars: {
      bg: "linear-gradient(180deg, #ecfccb 0%, #f7fee7 40%, #d9f99d 100%)",
      bgDark: "linear-gradient(180deg, #1a2e0a 0%, #0c1606 100%)",
      sectionFrom: "#65a30d",
      sectionTo: "#3f6212",
      sectionFromDark: "#a3e635",
      sectionToDark: "#4d7c0f",
      panel: "rgba(255,255,255,0.78)",
      panelDark: "rgba(22,40,10,0.8)",
      border: "rgba(101,163,13,0.28)",
      borderDark: "rgba(163,230,53,0.25)",
      text: "#1a2e05",
      textDark: "#ecfccb",
      muted: "#3f6212",
      mutedDark: "#bef264",
      accent: "#65a30d",
      accentDark: "#a3e635",
    },
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    blurb: "Ink and cyan. Made for dark rooms and late Messenger.",
    vars: {
      bg: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
      bgDark: "linear-gradient(180deg, #020617 0%, #0f172a 100%)",
      sectionFrom: "#22d3ee",
      sectionTo: "#6366f1",
      sectionFromDark: "#67e8f9",
      sectionToDark: "#818cf8",
      panel: "rgba(15,23,42,0.72)",
      panelDark: "rgba(2,6,23,0.78)",
      border: "rgba(34,211,238,0.28)",
      borderDark: "rgba(103,232,249,0.22)",
      text: "#e2e8f0",
      textDark: "#f8fafc",
      muted: "#94a3b8",
      mutedDark: "#cbd5e1",
      accent: "#22d3ee",
      accentDark: "#67e8f9",
    },
  },
  sunflower: {
    id: "sunflower",
    name: "Sunflower",
    blurb: "Warm yellow headers and a little kitchen-window light.",
    vars: {
      bg: "linear-gradient(180deg, #fef3c7 0%, #fffbeb 40%, #fde68a 100%)",
      bgDark: "linear-gradient(180deg, #422006 0%, #1c1005 100%)",
      sectionFrom: "#d97706",
      sectionTo: "#b45309",
      sectionFromDark: "#fbbf24",
      sectionToDark: "#d97706",
      panel: "rgba(255,255,255,0.8)",
      panelDark: "rgba(66,32,6,0.78)",
      border: "rgba(217,119,6,0.28)",
      borderDark: "rgba(251,191,36,0.25)",
      text: "#451a03",
      textDark: "#fef3c7",
      muted: "#92400e",
      mutedDark: "#fcd34d",
      accent: "#d97706",
      accentDark: "#fbbf24",
    },
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    blurb: "Aqua glass, like a dedicated-kitchen postcard from the coast.",
    vars: {
      bg: "linear-gradient(180deg, #cffafe 0%, #f0fdfa 40%, #a5f3fc 100%)",
      bgDark: "linear-gradient(180deg, #083344 0%, #042f2e 100%)",
      sectionFrom: "#0891b2",
      sectionTo: "#0d9488",
      sectionFromDark: "#22d3ee",
      sectionToDark: "#2dd4bf",
      panel: "rgba(255,255,255,0.78)",
      panelDark: "rgba(8,51,68,0.8)",
      border: "rgba(8,145,178,0.28)",
      borderDark: "rgba(34,211,238,0.25)",
      text: "#164e63",
      textDark: "#cffafe",
      muted: "#0e7490",
      mutedDark: "#67e8f9",
      accent: "#0891b2",
      accentDark: "#67e8f9",
    },
  },
};

export function isThemeId(v: string): v is ProfileThemeId {
  return (PROFILE_THEME_IDS as readonly string[]).includes(v);
}

export function isFlairId(v: string): v is NameFlairId {
  return NAME_FLAIRS.some((f) => f.id === v);
}

export function isAccentId(v: string): v is NameAccentId {
  return NAME_ACCENTS.some((a) => a.id === v);
}

export function isBackgroundType(v: string): v is BackgroundType {
  return (BACKGROUND_TYPES as readonly string[]).includes(v);
}

export function parseModuleOrder(raw: unknown): ProfileModuleId[] {
  const allowed = new Set(PROFILE_MODULES.map((m) => m.id));
  const fromJson = Array.isArray(raw) ? raw.filter((id): id is ProfileModuleId => allowed.has(id)) : [];
  const seen = new Set(fromJson);
  return [...fromJson, ...DEFAULT_MODULE_ORDER.filter((id) => !seen.has(id))];
}

const HEX = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

export function sanitizeHexColor(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const v = raw.trim();
  if (!HEX.test(v)) return null;
  if (v.length === 4) {
    return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`.toLowerCase();
  }
  return v.toLowerCase();
}

export function clampOverlay(n: number) {
  if (!Number.isFinite(n)) return 35;
  return Math.min(80, Math.max(0, Math.round(n)));
}

/** Guestbook: plain text only, no tags, tight length. */
export function sanitizeWallText(raw: string) {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function flairClass(id: string) {
  return isFlairId(id) ? `ps-flair-${id}` : "ps-flair-default";
}

export function accentClass(id: string) {
  return isAccentId(id) ? `ps-accent-${id}` : "ps-accent-brand";
}

export type StudioLook = {
  themeId: ProfileThemeId;
  coverUrl: string | null;
  backgroundType: BackgroundType;
  backgroundColor: string | null;
  backgroundUrl: string | null;
  overlayOpacity: number;
  moduleOrder: ProfileModuleId[];
  nameFlair: NameFlairId;
  nameAccent: NameAccentId;
};

export function defaultStudioLook(): StudioLook {
  return {
    themeId: "lumen",
    coverUrl: null,
    backgroundType: "theme",
    backgroundColor: null,
    backgroundUrl: null,
    overlayOpacity: 35,
    moduleOrder: [...DEFAULT_MODULE_ORDER],
    nameFlair: "default",
    nameAccent: "brand",
  };
}

export function studioLookFromProfile(p: {
  themeId?: string | null;
  coverUrl?: string | null;
  backgroundType?: string | null;
  backgroundColor?: string | null;
  backgroundUrl?: string | null;
  overlayOpacity?: number | null;
  moduleOrder?: unknown;
  nameFlair?: string | null;
  nameAccent?: string | null;
} | null | undefined): StudioLook {
  const base = defaultStudioLook();
  if (!p) return base;
  return {
    themeId: p.themeId && isThemeId(p.themeId) ? p.themeId : base.themeId,
    coverUrl: p.coverUrl ?? null,
    backgroundType: p.backgroundType && isBackgroundType(p.backgroundType) ? p.backgroundType : base.backgroundType,
    backgroundColor: p.backgroundColor ?? null,
    backgroundUrl: p.backgroundUrl ?? null,
    overlayOpacity: p.overlayOpacity ?? base.overlayOpacity,
    moduleOrder: parseModuleOrder(p.moduleOrder),
    nameFlair: p.nameFlair && isFlairId(p.nameFlair) ? p.nameFlair : base.nameFlair,
    nameAccent: p.nameAccent && isAccentId(p.nameAccent) ? p.nameAccent : base.nameAccent,
  };
}

/**
 * Messenger presence — classic MSN (online / away / offline) plus
 * celiac-aware statuses that stay "live" while lastSeen is fresh.
 */

export const PRESENCE_STATUSES = [
  {
    slug: "need-check-in",
    label: "Need a check-in",
    hint: "A hello would land well",
    live: true,
    sort: 0,
    fill: "#e85d4c",
    stroke: "#7a2020",
    dot: "bg-rose-500",
  },
  {
    slug: "dining-out",
    label: "Dining out",
    hint: "At a restaurant — wish me luck",
    live: true,
    sort: 10,
    fill: "#f59e0b",
    stroke: "#9a5b00",
    dot: "bg-amber-500",
  },
  {
    slug: "helping-new",
    label: "Helping someone new",
    hint: "Mentoring mode — ask away",
    live: true,
    sort: 15,
    fill: "#337bff",
    stroke: "#0a3a6e",
    dot: "bg-brand-500",
  },
  {
    slug: "online",
    label: "Online",
    hint: "Classic green",
    live: true,
    sort: 20,
    fill: "#2ecc3a",
    stroke: "#0a4a10",
    dot: "bg-emerald-500",
  },
  {
    slug: "quiet-today",
    label: "Quiet today",
    hint: "Here, but keeping it low-key",
    live: true,
    sort: 25,
    fill: "#8b5cf6",
    stroke: "#4c1d95",
    dot: "bg-violet-500",
  },
  {
    slug: "away",
    label: "Away",
    hint: "Stepped out",
    live: true,
    sort: 30,
    fill: "#f0c000",
    stroke: "#8a6a00",
    dot: "bg-amber-400",
  },
  {
    slug: "offline",
    label: "Appear offline",
    hint: "Hidden from the list",
    live: false,
    sort: 90,
    fill: "#c04040",
    stroke: "#7a2020",
    dot: "bg-sage-300",
  },
] as const;

export type PresenceSlug = (typeof PRESENCE_STATUSES)[number]["slug"];

const SLUGS = new Set<string>(PRESENCE_STATUSES.map((s) => s.slug));

export function isPresenceSlug(value: string | null | undefined): value is PresenceSlug {
  return Boolean(value && SLUGS.has(value));
}

export function presenceMeta(slug: string | null | undefined) {
  return PRESENCE_STATUSES.find((s) => s.slug === slug) ?? PRESENCE_STATUSES.find((s) => s.slug === "offline")!;
}

export function isLivePresence(slug: string | null | undefined) {
  return presenceMeta(slug).live;
}

/** Presence is only "live" if lastSeen is recent (default 60s). */
export function effectivePresence(
  presence: string | null | undefined,
  lastSeen: Date | string | null | undefined,
  windowMs = 60_000
): PresenceSlug {
  if (!presence || presence === "offline") return "offline";
  if (!lastSeen) return "offline";
  const seen = typeof lastSeen === "string" ? new Date(lastSeen) : lastSeen;
  if (Number.isNaN(seen.getTime()) || Date.now() - seen.getTime() > windowMs) {
    return "offline";
  }
  if (isPresenceSlug(presence)) return presence;
  return "online";
}

export function presenceLabel(status: string | null | undefined) {
  return presenceMeta(status).label;
}

export function presenceSortRank(status: string | null | undefined) {
  return presenceMeta(status).sort;
}

/** Tab hide/show should only auto-flip classic online ↔ away. */
export function isClassicAutoPresence(slug: string | null | undefined) {
  return slug === "online" || slug === "away";
}

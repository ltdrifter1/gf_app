/** Presence is only "live" if lastSeen is recent (default 60s). */
export function effectivePresence(
  presence: string | null | undefined,
  lastSeen: Date | string | null | undefined,
  windowMs = 60_000
): "online" | "away" | "offline" {
  if (!presence || presence === "offline") return "offline";
  if (!lastSeen) return "offline";
  const seen = typeof lastSeen === "string" ? new Date(lastSeen) : lastSeen;
  if (Number.isNaN(seen.getTime()) || Date.now() - seen.getTime() > windowMs) {
    return "offline";
  }
  if (presence === "away") return "away";
  if (presence === "online") return "online";
  return "offline";
}

export function presenceLabel(status: "online" | "away" | "offline") {
  if (status === "online") return "Online";
  if (status === "away") return "Away";
  return "Offline";
}

/** Quiet hours in local 0–23. Wraps overnight when start > end. */

export function inQuietHours(
  start: number | null | undefined,
  end: number | null | undefined,
  hour: number
) {
  if (start == null || end == null) return false;
  if (!Number.isInteger(start) || !Number.isInteger(end)) return false;
  if (start < 0 || start > 23 || end < 0 || end > 23) return false;
  if (start === end) return false;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

export function isValidTimeZone(tz: string | null | undefined): tz is string {
  if (!tz || tz.length > 80) return false;
  try {
    Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Hour 0–23 in the given IANA zone. Falls back to UTC when the zone is missing/invalid. */
export function hourInTimeZone(now: Date, timeZone: string | null | undefined): number {
  const zone = isValidTimeZone(timeZone) ? timeZone : "UTC";
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour: "numeric",
      hourCycle: "h23",
    }).formatToParts(now);
    const raw = Number(parts.find((p) => p.type === "hour")?.value);
    if (!Number.isFinite(raw)) return now.getUTCHours();
    return raw === 24 ? 0 : raw;
  } catch {
    return now.getUTCHours();
  }
}

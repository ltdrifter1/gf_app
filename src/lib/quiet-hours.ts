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

import { format, isSameDay, startOfDay, subDays } from "date-fns";
import type { JournalEntryView } from "@/components/wellness-widgets";

export function entryDay(iso: string) {
  return startOfDay(new Date(iso));
}

export function findTodayEntry(entries: JournalEntryView[], now = new Date()) {
  return entries.find((e) => isSameDay(new Date(e.createdAt), now)) ?? null;
}

/** Consecutive days with ≥1 entry, counting back from today (or yesterday if none today). */
export function journalStreakDays(entries: JournalEntryView[], now = new Date()): number {
  if (entries.length === 0) return 0;
  const days = new Set(entries.map((e) => entryDay(e.createdAt).getTime()));
  let cursor = startOfDay(now);
  if (!days.has(cursor.getTime())) {
    cursor = subDays(cursor, 1);
    if (!days.has(cursor.getTime())) return 0;
  }
  let streak = 0;
  while (days.has(cursor.getTime())) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export function firstLine(content: string, max = 72) {
  const line = content.trim().split(/\n/)[0] ?? "";
  if (line.length <= max) return line;
  return `${line.slice(0, max).trimEnd()}…`;
}

export function dayLabel(iso: string, now = new Date()) {
  const d = new Date(iso);
  if (isSameDay(d, now)) return "Today";
  if (isSameDay(d, subDays(now, 1))) return "Yesterday";
  return format(d, "MMM d");
}

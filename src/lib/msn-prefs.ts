/** Messenger prefs (sounds + desktop notifications) — client-only localStorage. */

export type MsnPrefs = {
  sounds: boolean;
  notifications: boolean;
};

const KEY = "safely-msn-prefs";

const DEFAULTS: MsnPrefs = { sounds: true, notifications: false };

export function getMsnPrefs(): MsnPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<MsnPrefs>;
    return {
      sounds: parsed.sounds !== false,
      notifications: Boolean(parsed.notifications),
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function setMsnPrefs(next: Partial<MsnPrefs>): MsnPrefs {
  const merged = { ...getMsnPrefs(), ...next };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("safely-msn-prefs", { detail: merged }));
  }
  return merged;
}

export function msnSoundsEnabled() {
  return getMsnPrefs().sounds;
}

export function msnNotificationsEnabled() {
  return getMsnPrefs().notifications;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function notifyMsnMessage(
  title: string,
  body: string,
  opts?: { evenIfVisible?: boolean; tag?: string }
) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (!msnNotificationsEnabled() || Notification.permission !== "granted") return;
  if (!opts?.evenIfVisible && document.visibilityState === "visible") return;
  try {
    new Notification(title, { body, icon: "/logo.png", tag: opts?.tag });
  } catch {
    /* ignore */
  }
}

/** In-app + browser ping for buddy / DM nudges while the tab is open. */
export function notifyBuddyNudge(title: string, body: string) {
  notifyMsnMessage(title, body, { evenIfVisible: true, tag: "safely-buddy" });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("safely-toast", { detail: { title, body } }));
  }
}

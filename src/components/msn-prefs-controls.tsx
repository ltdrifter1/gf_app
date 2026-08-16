"use client";

import { useEffect, useState } from "react";
import {
  ensureNotificationPermission,
  getMsnPrefs,
  setMsnPrefs,
  type MsnPrefs,
} from "@/lib/msn-prefs";
import { playMessageSound } from "@/lib/msn-sounds";

export function MsnPrefsControls() {
  const [prefs, setPrefs] = useState<MsnPrefs>({ sounds: true, notifications: false });

  useEffect(() => {
    setPrefs(getMsnPrefs());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<MsnPrefs>).detail;
      if (detail) setPrefs(detail);
    };
    window.addEventListener("safely-msn-prefs", onChange);
    return () => window.removeEventListener("safely-msn-prefs", onChange);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3 px-2 py-1 text-xs text-sage-500">
      <label className="inline-flex cursor-pointer items-center gap-1.5">
        <input
          type="checkbox"
          checked={prefs.sounds}
          onChange={(e) => {
            const next = setMsnPrefs({ sounds: e.target.checked });
            setPrefs(next);
            if (next.sounds) playMessageSound();
          }}
          className="rounded border-sage-300"
        />
        Sounds
      </label>
      <label className="inline-flex cursor-pointer items-center gap-1.5">
        <input
          type="checkbox"
          checked={prefs.notifications}
          onChange={async (e) => {
            const want = e.target.checked;
            if (want) {
              const ok = await ensureNotificationPermission();
              const next = setMsnPrefs({ notifications: ok });
              setPrefs(next);
            } else {
              setPrefs(setMsnPrefs({ notifications: false }));
            }
          }}
          className="rounded border-sage-300"
        />
        Alerts
      </label>
    </div>
  );
}

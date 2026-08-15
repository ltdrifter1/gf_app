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
    <div className="flex flex-wrap items-center gap-2 px-2 py-1 text-[11px] text-[#333] dark:text-sage-300">
      <label className="inline-flex cursor-pointer items-center gap-1">
        <input
          type="checkbox"
          checked={prefs.sounds}
          onChange={(e) => {
            const next = setMsnPrefs({ sounds: e.target.checked });
            setPrefs(next);
            if (next.sounds) playMessageSound();
          }}
        />
        Sounds
      </label>
      <label className="inline-flex cursor-pointer items-center gap-1">
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
        />
        Alerts
      </label>
    </div>
  );
}

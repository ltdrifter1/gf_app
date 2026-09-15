"use client";

import { useEffect } from "react";
import { getMsnPrefs } from "@/lib/msn-prefs";
import { subscribeWebPush } from "@/lib/web-push-client";

/** Registers the installable service worker and attaches Web Push when Alerts are on. */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        const prefs = getMsnPrefs();
        if (
          prefs.notifications &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          subscribeWebPush().catch(() => {});
        }
      })
      .catch(() => {});
  }, []);
  return null;
}

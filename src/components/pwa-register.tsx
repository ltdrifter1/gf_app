"use client";

import { useEffect } from "react";

/** Registers the installable service worker. Web Push VAPID can attach later. */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}

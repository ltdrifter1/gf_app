"use client";

import { useEffect } from "react";

/** Keeps lastSeen fresh; respects Away/Offline from profile and tab visibility. */
export function PresenceHeartbeat() {
  useEffect(() => {
    const ping = (hidden?: boolean) =>
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hidden: hidden ?? document.visibilityState === "hidden",
        }),
      }).catch(() => {});

    ping(false);
    const id = setInterval(() => ping(), 25000);
    const onVisibility = () => {
      ping(document.visibilityState === "hidden");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return null;
}

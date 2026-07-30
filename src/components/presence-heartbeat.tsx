"use client";

import { useEffect } from "react";

// Periodically pings the server to keep the user's presence "online".
export function PresenceHeartbeat() {
  useEffect(() => {
    const ping = () =>
      fetch("/api/presence", { method: "POST" }).catch(() => {});
    ping();
    const id = setInterval(ping, 25000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return null;
}

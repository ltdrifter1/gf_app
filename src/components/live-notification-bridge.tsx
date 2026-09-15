"use client";

import { useEffect, useRef, useState } from "react";
import { getNotifications } from "@/lib/actions/notifications";
import { notifyBuddyNudge } from "@/lib/msn-prefs";
import { playMessageSound } from "@/lib/msn-sounds";

/**
 * Polls in-app notifications and surfaces DM / buddy nudges while the tab is open.
 */
export function LiveNotificationBridge() {
  const seen = useRef<Set<string>>(new Set());
  const primed = useRef(false);
  const [toast, setToast] = useState<{ title: string; body: string; href?: string | null } | null>(
    null
  );

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<{ title: string; body: string; href?: string }>).detail;
      if (detail) setToast(detail);
    };
    window.addEventListener("lumen-toast", onToast);
    return () => window.removeEventListener("lumen-toast", onToast);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const data = await getNotifications(8);
        if (cancelled) return;
        for (const n of data.items) {
          if (seen.current.has(n.id)) continue;
          seen.current.add(n.id);
          if (!primed.current) continue;
          if (n.readAt) continue;
          if (n.type === "companion" || n.type === "message" || n.type === "dining") {
            playMessageSound();
            notifyBuddyNudge(n.title, n.body);
            setToast({ title: n.title, body: n.body, href: n.href });
          }
        }
        primed.current = true;
      } catch {
        /* ignore */
      }
    }
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  if (!toast) return null;
  const inner = (
    <>
      <p className="text-sm font-semibold text-sage-900 dark:text-white">{toast.title}</p>
      <p className="mt-0.5 text-xs text-sage-600 dark:text-sage-300">{toast.body}</p>
    </>
  );
  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[70] max-w-sm lg:bottom-6">
      {toast.href ? (
        <a
          href={toast.href}
          className="pointer-events-auto block rounded-2xl border border-white/50 bg-white/95 p-3 shadow-glass-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1715]/95"
        >
          {inner}
        </a>
      ) : (
        <div className="pointer-events-auto rounded-2xl border border-white/50 bg-white/95 p-3 shadow-glass-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1715]/95">
          {inner}
        </div>
      )}
    </div>
  );
}

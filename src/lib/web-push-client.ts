"use client";

import { urlBase64ToUint8Array } from "@/lib/vapid";

export async function subscribeWebPush() {
  if (typeof window === "undefined") return { ok: false as const };
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false as const };
  }
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (!key) return { ok: false as const, stub: true as const };

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });
    }
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    return { ok: Boolean(res.ok && json?.ok) };
  } catch {
    return { ok: false as const };
  }
}

export async function unsubscribeWebPush() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    }).catch(() => {});
    await sub.unsubscribe().catch(() => {});
  } catch {
    /* ignore */
  }
}

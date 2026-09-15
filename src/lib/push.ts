/**
 * Web-push foundations. Browser Notification API works without VAPID.
 * Real Web Push (even with the tab closed) needs VAPID keys in env —
 * do not rewrite this module; fill keys and POST /api/push/subscribe.
 */

export function vapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || null;
}

export function webPushConfigured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY?.trim() &&
      process.env.VAPID_PRIVATE_KEY?.trim() &&
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()
  );
}

export const PUSH_STUB_NOTE =
  "Browser alerts work in this tab when you allow notifications. Closed-tab Web Push needs VAPID keys (NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY).";

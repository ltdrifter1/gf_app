"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getNotifications, markNotificationsRead } from "@/lib/actions/notifications";
import { timeAgo, cn } from "@/lib/utils";

type Item = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell({ initialUnread = 0 }: { initialUnread?: number }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<Item[]>([]);
  const [pending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function load() {
    startTransition(async () => {
      const data = await getNotifications(25);
      setItems(data.items);
      setUnread(data.unread);
    });
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) load();
  }

  function markAll() {
    startTransition(async () => {
      await markNotificationsRead();
      setItems((prev) => prev.map((i) => ({ ...i, readAt: i.readAt ?? new Date().toISOString() })));
      setUnread(0);
    });
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="btn-ghost relative p-2"
        aria-label="Notifications"
        onClick={toggle}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 inline-flex min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/50 bg-white/95 shadow-glass-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1715]/95">
          <div className="flex items-center justify-between border-b border-sage-100 px-4 py-3 dark:border-white/10">
            <p className="text-sm font-semibold text-sage-900 dark:text-white">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                className="text-xs font-medium text-brand-600 hover:underline"
                onClick={markAll}
                disabled={pending}
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-sage-500">
                {pending ? "Loading…" : "You're all caught up."}
              </p>
            )}
            {items.map((n) => {
              const inner = (
                <div
                  className={cn(
                    "border-b border-sage-50 px-4 py-3 transition hover:bg-sage-50/80 dark:border-white/5 dark:hover:bg-white/5",
                    !n.readAt && "bg-brand-50/40 dark:bg-brand-500/10"
                  )}
                >
                  <p className="text-sm font-semibold text-sage-900 dark:text-white">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-sage-600 dark:text-sage-300">
                    {n.body}
                  </p>
                  <p className="mt-1 text-[10px] text-sage-400">{timeAgo(n.createdAt)}</p>
                </div>
              );
              return n.href ? (
                <Link key={n.id} href={n.href} onClick={() => setOpen(false)}>
                  {inner}
                </Link>
              ) : (
                <div key={n.id}>{inner}</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

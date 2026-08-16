"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MessageCircle,
  Users,
  UtensilsCrossed,
  UserRound,
  Menu,
  X,
  Search,
  LogOut,
  BookOpen,
  HeartPulse,
  Bookmark,
  Shield,
} from "lucide-react";
import { Logo } from "./logo";
import { Avatar } from "./ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";
import { cn } from "@/lib/utils";

type NavUser = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  role: string;
  presence: string;
};

const SIDEBAR_NAV = [
  { href: "/app/chat", label: "Messenger", icon: MessageCircle },
  { href: "/app", label: "Community", icon: Users, exact: true },
  { href: "/app/health", label: "Health", icon: HeartPulse },
  { href: "/app/restaurants", label: "Dining", icon: UtensilsCrossed },
  { href: "/app/recipes", label: "Recipes", icon: BookOpen },
  { href: "/app/saved", label: "Saved", icon: Bookmark },
  { href: "/app/profile", label: "You", icon: UserRound },
] as const;

/** Compact primary tabs for the mobile bottom bar */
const MOBILE_NAV = [
  { href: "/app/chat", label: "Messenger", icon: MessageCircle },
  { href: "/app", label: "Community", icon: Users, exact: true },
  { href: "/app/restaurants", label: "Dining", icon: UtensilsCrossed },
  { href: "/app/profile", label: "You", icon: UserRound },
] as const;

function navActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function AppShell({
  user,
  messengerUnread = 0,
  notificationUnread = 0,
  children,
}: {
  user: NavUser;
  messengerUnread?: number;
  notificationUnread?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="glass-strong m-3 flex h-[calc(100vh-1.5rem)] flex-col rounded-3xl p-4">
          <div className="flex items-center justify-between px-1">
            <Link href="/app/chat" onClick={() => setOpen(false)}>
              <Logo size={42} />
            </Link>
            <button className="btn-ghost p-2 lg:hidden" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
            {SIDEBAR_NAV.map((item) => {
              const Icon = item.icon;
              const active = navActive(pathname, item.href, "exact" in item ? item.exact : false);
              const showUnread = item.href === "/app/chat" && messengerUnread > 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn("nav-link", active && "nav-link-active")}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                  {showUnread && <UnreadBadge count={messengerUnread} />}
                </Link>
              );
            })}

            {user.role === "ADMIN" && (
              <Link
                href="/app/admin"
                onClick={() => setOpen(false)}
                className={cn(
                  "nav-link mt-2",
                  pathname.startsWith("/app/admin") && "nav-link-active"
                )}
              >
                <Shield className="h-[18px] w-[18px]" />
                Admin
              </Link>
            )}
          </nav>

          <Link
            href="/app/profile"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center gap-3 rounded-2xl border border-white/50 bg-white/50 p-2.5 transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <Avatar name={user.name} src={user.avatarUrl} size={40} presence={user.presence} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-sage-900 dark:text-white">
                {user.name}
              </p>
              <p className="truncate text-xs text-sage-500 dark:text-sage-400">
                @{user.username}
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 px-3 pt-3">
          <div className="glass flex items-center gap-3 rounded-3xl px-3 py-2.5">
            <button className="btn-ghost p-2 lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <form action="/app/search" className="relative hidden flex-1 sm:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" />
              <input
                name="q"
                placeholder="Search posts, people, restaurants…"
                className="input pl-10"
              />
            </form>
            <div className="flex-1 sm:hidden" />
            <Link href="/app/search" className="btn-ghost p-2 sm:hidden" title="Search">
              <Search className="h-5 w-5" />
            </Link>
            <NotificationBell initialUnread={notificationUnread} />
            <ThemeToggle />
            <form action="/api/auth/logout" method="post">
              <button className="btn-ghost p-2" title="Sign out" type="submit">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>

        <main
          className={cn(
            "flex-1 p-3",
            "pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-3"
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom bar — Messenger as hero tab */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-end justify-around border-t border-white/50 bg-white/90 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1412]/95 lg:hidden"
        aria-label="Primary"
      >
        {MOBILE_NAV.map((item) => {
          const active = navActive(pathname, item.href, "exact" in item ? item.exact : false);
          const Icon = item.icon;
          const isHero = item.href === "/app/chat";
          const showUnread = isHero && messengerUnread > 0;

          if (isHero) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-5 flex flex-col items-center"
                aria-label="Messenger"
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "relative flex h-14 w-14 items-center justify-center rounded-full bg-safely-gradient text-white transition",
                    active && "scale-105 ring-4 ring-brand-200/60 dark:ring-brand-500/30"
                  )}
                  style={{
                    boxShadow:
                      "inset 0 1px 0 0 rgba(255,255,255,0.4), 0 8px 24px -8px rgba(51, 123, 255, 0.55)",
                  }}
                >
                  <Icon className="h-6 w-6" />
                  {showUnread && (
                    <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[1.15rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#0c1412]">
                      {messengerUnread > 99 ? "99+" : messengerUnread}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "mt-1 text-[10px] font-semibold",
                    active ? "text-brand-600 dark:text-brand-300" : "text-sage-500"
                  )}
                >
                  Messenger
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-[4.5rem] flex-col items-center gap-0.5 px-2 py-1",
                active ? "text-brand-600 dark:text-brand-300" : "text-sage-500"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.25]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

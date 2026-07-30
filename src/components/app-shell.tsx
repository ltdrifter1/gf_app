"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  MessageCircle,
  Crown,
  Shield,
  Menu,
  X,
  Search,
  LogOut,
  Bookmark,
} from "lucide-react";
import { Logo } from "./logo";
import { Avatar } from "./ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

type NavUser = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  role: string;
  isPremium: boolean;
  presence: string;
};

const NAV = [
  { href: "/app", label: "Community", icon: Home, exact: true },
  { href: "/app/chat", label: "Messenger", icon: MessageCircle },
  { href: "/app/saved", label: "Saved", icon: Bookmark },
  { href: "/app/premium", label: "Premium", icon: Crown },
];

export function AppShell({
  user,
  children,
}: {
  user: NavUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = [...NAV];
  if (user.role === "ADMIN") {
    nav.push({ href: "/app/admin", label: "Admin", icon: Shield });
  }

  function isActive(item: (typeof NAV)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

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
            <Link href="/app" onClick={() => setOpen(false)}>
              <Logo />
            </Link>
            <button className="lg:hidden btn-ghost p-2" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn("nav-link", isActive(item) && "nav-link-active")}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                  {item.href === "/app/premium" && !user.isPremium && (
                    <span className="ml-auto chip bg-warm-400/20 text-warm-500">PRO</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/app/profile"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center gap-3 rounded-2xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 p-2.5 hover:bg-white/80 dark:hover:bg-white/10 transition"
          >
            <Avatar name={user.name} src={user.avatarUrl} size={40} presence={user.presence} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-sage-900 dark:text-white">
                {user.name}
                {user.isPremium && <Crown className="ml-1 inline h-3.5 w-3.5 text-warm-500" />}
              </p>
              <p className="truncate text-xs text-sage-500 dark:text-sage-400">@{user.username}</p>
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
            <button className="lg:hidden btn-ghost p-2" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <form action="/app/search" className="relative hidden flex-1 sm:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" />
              <input
                name="q"
                placeholder="Search posts, people, rooms…"
                className="input pl-10"
              />
            </form>
            <div className="flex-1 sm:hidden" />
            <ThemeToggle />
            <form action="/api/auth/logout" method="post">
              <button className="btn-ghost p-2" title="Sign out" type="submit">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-3">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { MsnPresenceIcon } from "@/components/msn-presence-icon";
import { cn } from "@/lib/utils";

const MENUS = ["File", "Edit", "Actions", "Tools", "Help"] as const;

/** Classic Instant Message titlebar + menu strip (decorative XP chrome). */
export function MsnWindowChrome({
  subtitle,
  className,
}: {
  subtitle?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("shrink-0", className)}>
      <div className="msn-titlebar">
        <MsnPresenceIcon status="online" size={14} />
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold tracking-wide">
          Safely Messenger
        </span>
        {subtitle ? (
          <span className="hidden max-w-[40%] truncate text-[10px] font-medium text-white/75 sm:inline">
            {subtitle}
          </span>
        ) : null}
        <div className="msn-titlebar-controls" aria-hidden>
          <span className="msn-titlebar-btn">–</span>
          <span className="msn-titlebar-btn">□</span>
          <span className="msn-titlebar-btn msn-titlebar-btn-close">×</span>
        </div>
      </div>
      <div className="msn-menubar">
        {MENUS.map((label) => (
          <button key={label} type="button" tabIndex={-1}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

const SAYS_PALETTE = [
  "#b42318",
  "#0a6ebd",
  "#0d7a3f",
  "#7c3aed",
  "#c2410c",
  "#0f766e",
  "#a21caf",
  "#1d4ed8",
] as const;

/** Stable classic “Name says:” color from a display name. */
export function msnSaysColor(name: string, mine?: boolean) {
  if (mine) return "#0a6ebd";
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return SAYS_PALETTE[hash % SAYS_PALETTE.length];
}

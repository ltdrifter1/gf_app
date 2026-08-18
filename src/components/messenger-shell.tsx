import { MsnWindowChrome } from "@/components/msn-window-chrome";
import { cn } from "@/lib/utils";

/** Single Instant Message window — XP glass chrome wrapping sidebar + main. */
export function MessengerShell({
  sidebar,
  main,
  subtitle,
  className,
}: {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  subtitle?: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "msn-window msn-window-hero messenger-fill mx-auto flex w-full max-w-6xl flex-col",
        className
      )}
    >
      <MsnWindowChrome subtitle={subtitle ?? "Home"} />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-full min-h-0 flex-col border-[#94a3b8]/50 dark:border-white/10 lg:w-[300px] lg:shrink-0 lg:border-r">
          {sidebar}
        </aside>
        <section className="hidden min-h-0 min-w-0 flex-1 flex-col lg:flex">{main}</section>
      </div>
    </div>
  );
}

/** Room view: conversation fills the shell; contact list stays on desktop. */
export function MessengerRoomShell({
  sidebar,
  main,
  subtitle,
  className,
}: {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  subtitle?: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "msn-window msn-window-hero messenger-fill mx-auto flex w-full max-w-6xl flex-col",
        className
      )}
    >
      <MsnWindowChrome subtitle={subtitle} />
      <div className="flex min-h-0 flex-1">
        <aside className="hidden min-h-0 w-[300px] shrink-0 flex-col border-r border-[#94a3b8]/50 dark:border-white/10 lg:flex">
          {sidebar}
        </aside>
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">{main}</section>
      </div>
    </div>
  );
}

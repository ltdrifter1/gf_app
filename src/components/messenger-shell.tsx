import { cn } from "@/lib/utils";

/** Single-window Messenger frame — sidebar + main share one glass shell. */
export function MessengerShell({
  sidebar,
  main,
  className,
}: {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "messenger-shell messenger-fill mx-auto w-full max-w-6xl",
        className
      )}
    >
      <aside className="flex w-full min-h-0 flex-col border-sage-200/60 dark:border-white/10 lg:w-[320px] lg:shrink-0 lg:border-r">
        {sidebar}
      </aside>
      <section className="hidden min-h-0 min-w-0 flex-1 flex-col lg:flex">{main}</section>
    </div>
  );
}

/** Room view: sidebar hidden on mobile so the conversation fills the shell. */
export function MessengerRoomShell({
  sidebar,
  main,
  className,
}: {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "messenger-shell messenger-fill mx-auto w-full max-w-6xl",
        className
      )}
    >
      <aside className="hidden min-h-0 w-[320px] shrink-0 flex-col border-r border-sage-200/60 dark:border-white/10 lg:flex">
        {sidebar}
      </aside>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">{main}</section>
    </div>
  );
}

import { cn } from "@/lib/utils";

export function Logo({
  className = "",
  showText = true,
  size = 36,
}: {
  className?: string;
  showText?: boolean;
  size?: number;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative grid place-items-center rounded-2xl bg-amity-gradient text-white shadow-glow"
        style={{
          width: size,
          height: size,
          boxShadow:
            "inset 0 1px 0 0 rgba(255,255,255,0.45), 0 8px 24px -8px rgba(13,148,136,0.55)",
        }}
      >
        <span
          className="font-display font-bold tracking-tight text-white"
          style={{ fontSize: size * 0.42, letterSpacing: "-0.04em" }}
        >
          A
        </span>
      </div>
      {showText && (
        <div className="leading-tight">
          <span className="block font-display text-lg font-bold tracking-tight text-sage-900 dark:text-white">
            Amity
          </span>
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.12em] text-sage-500 sm:block">
            Your GF companion
          </span>
        </div>
      )}
    </div>
  );
}

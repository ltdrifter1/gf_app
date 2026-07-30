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
        className="relative grid place-items-center rounded-2xl bg-ycn-gradient text-white shadow-glow"
        style={{
          width: size,
          height: size,
          boxShadow:
            "inset 0 1px 0 0 rgba(255,255,255,0.45), 0 8px 24px -8px rgba(51,123,255,0.6)",
        }}
      >
        <span
          className="font-display font-bold tracking-tight text-white"
          style={{ fontSize: size * 0.32, letterSpacing: "-0.02em" }}
        >
          YCN
        </span>
      </div>
      {showText && (
        <div className="leading-tight">
          <span className="block font-display text-lg font-bold tracking-tight text-sage-900 dark:text-white">
            YCN
          </span>
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.12em] text-sage-500 sm:block">
            Your Celiac Network
          </span>
        </div>
      )}
    </div>
  );
}

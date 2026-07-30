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
        className="relative grid place-items-center rounded-2xl bg-circle-gradient text-white shadow-glow"
        style={{ width: size, height: size, boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.45), 0 8px 24px -8px rgba(51,123,255,0.6)" }}
      >
        {/* Overlapping circles — community coming together */}
        <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="none">
          <circle cx="9.5" cy="12" r="5" stroke="#fff" strokeWidth="1.7" opacity="0.95" />
          <circle cx="14.5" cy="12" r="5" stroke="#fff" strokeWidth="1.7" opacity="0.7" />
        </svg>
      </div>
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight text-sage-900 dark:text-white">
          Circle
        </span>
      )}
    </div>
  );
}

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
        className="relative grid place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-sage-500 text-white shadow-soft"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none">
          <path
            d="M12 3c-2.5 2-4 4.5-4 7.5 0 3.5 2 6 4 7.5 2-1.5 4-4 4-7.5 0-3-1.5-5.5-4-7.5Z"
            fill="currentColor"
            opacity="0.95"
          />
          <path d="M12 7v9" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        </svg>
      </div>
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight text-sage-900 dark:text-white">
          Gluten Free <span className="text-brand-600 dark:text-brand-300">Collective</span>
        </span>
      )}
    </div>
  );
}

import Image from "next/image";
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
      <Image
        src="/logo.webp"
        alt="Safely Celiac Community"
        width={size}
        height={size}
        className="rounded-[22%] shadow-soft"
        style={{ width: size, height: size }}
        priority
      />
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight text-sage-900 dark:text-white">
          Safely
        </span>
      )}
    </div>
  );
}

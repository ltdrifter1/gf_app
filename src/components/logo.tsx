import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className = "",
  size = 36,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/logo.webp"
      alt="Safely Celiac Community"
      width={size}
      height={size}
      className={cn("rounded-[22%] shadow-soft", className)}
      style={{ width: size, height: size }}
      priority
    />
  );
}

import { cn } from "@/lib/utils";
import { presenceMeta } from "@/lib/presence";

/** Classic MSN-style presence “guy” icon — colours track meaningful statuses. */
export function MsnPresenceIcon({
  status,
  size = 14,
  className,
}: {
  status: string;
  size?: number;
  className?: string;
}) {
  const meta = presenceMeta(status);
  const fill = meta.fill;
  const stroke = meta.stroke;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <circle cx="8" cy="5" r="3.2" fill={fill} stroke={stroke} strokeWidth="0.8" />
      <path
        d="M2.5 14.5c0-3.2 2.4-5 5.5-5s5.5 1.8 5.5 5"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

import { cn } from "@/lib/utils";

/** Classic MSN-style presence “guy” icon. */
export function MsnPresenceIcon({
  status,
  size = 14,
  className,
}: {
  status: "online" | "away" | "offline" | string;
  size?: number;
  className?: string;
}) {
  const fill =
    status === "online" ? "#2ecc3a" : status === "away" ? "#f0c000" : "#c04040";
  const stroke = status === "offline" ? "#7a2020" : "#0a4a10";

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

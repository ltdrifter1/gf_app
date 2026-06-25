import { avatarGradient, initials, cn } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = 40,
  className = "",
  presence,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
  presence?: string | null;
}) {
  const dot =
    presence === "online"
      ? "bg-emerald-500"
      : presence === "away"
      ? "bg-amber-400"
      : "bg-sage-300";

  return (
    <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className={cn("rounded-full object-cover", className)}
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className={cn(
            "grid place-items-center rounded-full bg-gradient-to-br font-semibold text-white",
            avatarGradient(name),
            className
          )}
          style={{ width: size, height: size, fontSize: size * 0.38 }}
        >
          {initials(name)}
        </div>
      )}
      {presence && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-[#0e1512]",
            dot
          )}
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  );
}

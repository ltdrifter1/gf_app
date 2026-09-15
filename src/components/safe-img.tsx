import { safeImageSrc } from "@/lib/safe-image";

export function SafeImg({
  src,
  alt,
  className,
  width,
  height,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  const safe = safeImageSrc(src);
  if (!safe) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={safe} alt={alt} className={className} width={width} height={height} referrerPolicy="no-referrer" />
  );
}

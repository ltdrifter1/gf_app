"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export function StarRating({
  name,
  defaultValue = 5,
  size = 22,
}: {
  name: string;
  defaultValue?: number;
  size?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={value} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => setValue(n)}
          className="transition hover:scale-110"
        >
          <Star
            style={{ width: size, height: size }}
            className={
              n <= (hover || value)
                ? "fill-amber-400 text-amber-400"
                : "text-sage-300 dark:text-sage-600"
            }
          />
        </button>
      ))}
    </div>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-sage-300 dark:text-sage-600"}
        />
      ))}
    </div>
  );
}

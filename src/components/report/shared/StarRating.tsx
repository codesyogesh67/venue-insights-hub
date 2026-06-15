import { Star } from "lucide-react";
export function StarRating({ stars }: { stars: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${stars} stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < stars ? "var(--color-accent)" : "transparent"}
          stroke={i < stars ? "var(--color-accent)" : "var(--color-muted)"}
        />
      ))}
    </span>
  );
}

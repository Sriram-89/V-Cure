"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function RatingStars({
  rating,
  ratingCount,
  size = "md"
}: {
  rating: number;
  ratingCount?: number;
  size?: "sm" | "md";
}) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              iconSize,
              i < Math.round(rating) ? "fill-warning text-warning" : "text-border"
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-sm text-text-secondary">
        {rating.toFixed(1)}
        {ratingCount !== undefined ? ` (${ratingCount})` : ""}
      </span>
    </div>
  );
}

export function RatingInput({
  value,
  onChange
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rate this recipe">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            onClick={() => onChange(starValue)}
          >
            <Star
              className={cn(
                "h-6 w-6",
                starValue <= value ? "fill-warning text-warning" : "text-border"
              )}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}

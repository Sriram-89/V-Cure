"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RatingStars, RatingInput } from "@/components/recipes/rating-stars";
import { useSubmitRecipeReview } from "@/hooks/use-recipes";
import type { RecipeReview } from "@/types/recipes";

export function ReviewsSection({
  recipeId,
  reviews
}: {
  recipeId: string;
  reviews: RecipeReview[];
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const submitReview = useSubmitRecipeReview(recipeId);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (rating === 0) return;
    submitReview.mutate(
      { rating, comment },
      {
        onSuccess: () => {
          setRating(0);
          setComment("");
        }
      }
    );
  };

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-text-primary">Reviews</h2>

      <form onSubmit={handleSubmit} className="rounded-md border border-border p-4">
        <p className="text-xs font-medium text-text-secondary">Leave a review</p>
        <div className="mt-2">
          <RatingInput value={rating} onChange={setRating} />
        </div>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What did you think?"
          rows={2}
          className="mt-3 w-full rounded-input border border-border bg-surface p-2 text-sm text-text-primary focus-visible:border-primary"
        />
        {submitReview.isError ? (
          <div role="alert" className="mt-2 flex items-center gap-2 text-xs text-danger">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Couldn&apos;t submit your review. Try again.
          </div>
        ) : null}
        <div className="mt-3 flex justify-end">
          <Button type="submit" size="sm" disabled={rating === 0} isLoading={submitReview.isPending}>
            Submit review
          </Button>
        </div>
      </form>

      <div className="mt-4 flex flex-col gap-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-text-secondary">No reviews yet — be the first to leave one.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-4 last:border-none">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">{review.authorName}</span>
                <span className="text-xs text-text-secondary">{review.createdAt}</span>
              </div>
              <div className="mt-1">
                <RatingStars rating={review.rating} size="sm" />
              </div>
              <p className="mt-2 text-sm text-text-secondary">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

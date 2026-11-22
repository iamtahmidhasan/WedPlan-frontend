"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Send, Loader2, Edit3, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/core/client";

export interface ExistingReview {
  _id: string;
  serviceId: string;
  rating: number;
  review: string;
  user?: string;
  userName?: string;
  date?: string;
}

export function CustomerReviewForm({
  serviceId,
  serviceName,
  initialReview,
}: {
  serviceId: string;
  serviceName?: string;
  initialReview?: ExistingReview | null;
}) {
  const router = useRouter();
  const [currentReview, setCurrentReview] = useState<ExistingReview | null>(initialReview || null);
  const [isEditing, setIsEditing] = useState(!initialReview);
  const [rating, setRating] = useState(initialReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState(initialReview?.review || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim()) {
      toast.error("Please enter a short review message");
      return;
    }

    setIsSubmitting(true);
    const endpoint = currentReview?._id ? `/reviews/${currentReview._id}` : "/reviews";
    const method = currentReview?._id ? "PUT" : "POST";

    apiFetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        rating,
        review: review.trim(),
      }),
    })
      .then((res) => {
        if (!res.ok) {
          toast.error("Failed to submit review");
          setIsSubmitting(false);
          return;
        }

        const successMessage = currentReview?._id
          ? "Your review has been updated successfully!"
          : "Thank you! Your review has been submitted.";
        toast.success(successMessage);

        setCurrentReview({
          _id: currentReview?._id || "updated",
          serviceId,
          rating,
          review: review.trim(),
          date: new Date().toISOString(),
        });
        setIsEditing(false);
        setIsSubmitting(false);
        router.refresh();
      })
      .catch(() => {
        toast.error("Failed to submit review");
        setIsSubmitting(false);
      });
  };

  // If already reviewed and not in edit mode, display the existing review
  if (!isEditing && currentReview) {
    const formattedDate = currentReview.date
      ? new Date(currentReview.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Verified Review";

    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                Your Review {serviceName ? `for ${serviceName}` : ""}
              </h3>
              <p className="text-xs text-muted-foreground">
                Submitted on {formattedDate}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setRating(currentReview.rating || 5);
              setReview(currentReview.review || "");
              setIsEditing(true);
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-secondary cursor-pointer shrink-0"
          >
            <Edit3 className="size-3.5 text-primary" />
            <span>Edit Review</span>
          </button>
        </div>

        {/* Rating Stars & Text */}
        <div className="space-y-2 rounded-lg border border-border/60 bg-card p-4">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${
                    i < currentReview.rating
                      ? "fill-amber-500 text-amber-500"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-xs font-bold text-foreground ml-1">
              {currentReview.rating} / 5 Stars
            </span>
          </div>

          <p className="text-xs leading-relaxed text-foreground whitespace-pre-line">
            &ldquo;{currentReview.review}&rdquo;
          </p>
        </div>
      </div>
    );
  }

  // Edit / Add Form Mode
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">
            {currentReview ? "Edit Your Review" : "Leave a Review"}{" "}
            {serviceName ? `for ${serviceName}` : ""}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {currentReview
              ? "Update your rating or celebration feedback below."
              : "Your wedding service is completed! Please rate your experience to help other couples plan their special day."}
          </p>
        </div>

        {currentReview && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
          >
            <X className="size-3.5" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating Selector */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Your Rating
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= (hoverRating || rating);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-amber-500 transition-transform hover:scale-110 cursor-pointer"
                  aria-label={`Rate ${star} star`}
                >
                  <Star
                    className={`size-6 ${
                      active ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              );
            })}
            <span className="ml-2 font-mono text-xs font-semibold text-foreground">
              {rating} / 5 Stars
            </span>
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Your Experience
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
            placeholder="Share what made this service memorable, how the team communicated, or any tips for other couples..."
            className="w-full rounded-md border border-input bg-background p-3 text-xs leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            <span>{currentReview ? "Update Review" : "Submit Review"}</span>
          </button>

          {currentReview && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsEditing(false)}
              className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

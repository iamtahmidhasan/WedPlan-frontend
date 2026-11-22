"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/core/client";

export function CustomerReviewForm({
  serviceId,
  serviceName,
}: {
  serviceId: string;
  serviceName?: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim()) {
      toast.error("Please enter a short review message");
      return;
    }

    setIsSubmitting(true);
    apiFetch("/reviews", {
      method: "POST",
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
        toast.success("Thank you! Your review has been submitted.");
        setSubmitted(true);
        setIsSubmitting(false);
        router.refresh();
      })
      .catch(() => {
        toast.error("Failed to submit review");
        setIsSubmitting(false);
      });
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
        <p className="font-heading text-lg font-bold text-emerald-700 dark:text-emerald-400">
          Review Submitted
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Thank you for sharing your experience! Your review is now visible to future couples.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
      <div>
        <h3 className="font-heading text-xl font-bold text-foreground">
          Leave a Review {serviceName ? `for ${serviceName}` : ""}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Your wedding service is completed! Please rate your experience to help other couples plan their special day.
        </p>
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
          <span>Submit Review</span>
        </button>
      </form>
    </div>
  );
}

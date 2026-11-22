"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/core/client";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeleteReviewButton({
  id,
  reviewerName,
}: {
  id: string;
  reviewerName?: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    apiFetch(`/reviews/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          toast.error("Failed to delete review");
          setIsDeleting(false);
          return;
        }
        toast.success("Review deleted successfully");
        router.refresh();
      })
      .catch(() => {
        toast.error("Failed to delete review");
        setIsDeleting(false);
      });
  };

  return (
    <ConfirmDialog
      title="Delete Review"
      description={`Are you sure you want to permanently delete this review${
        reviewerName ? ` from ${reviewerName}` : ""
      }? This action cannot be undone.`}
      confirmLabel="Delete Review"
      variant="destructive"
      onConfirm={handleDelete}
      trigger={
        <button
          type="button"
          disabled={isDeleting}
          className="inline-flex size-8 items-center justify-center rounded-md border border-destructive/20 text-destructive transition-colors hover:bg-destructive/10 cursor-pointer disabled:opacity-50"
          title="Delete this review"
        >
          {isDeleting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
        </button>
      }
    />
  );
}

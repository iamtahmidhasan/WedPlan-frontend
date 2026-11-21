"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { apiFetch } from "@/lib/core/client";

interface CancelBookingButtonProps {
  id: string;
  serviceName?: string;
  disabled?: boolean;
}

export function CancelBookingButton({
  id,
  serviceName,
  disabled = false,
}: CancelBookingButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    try {
      const res = await apiFetch(`/bookings?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to cancel booking request");
      }

      toast.success("Booking Request Cancelled", {
        description: serviceName
          ? `Your inquiry for "${serviceName}" has been cancelled.`
          : "Your booking request has been cancelled.",
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  }

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground opacity-50 cursor-not-allowed"
        title="Accepted, rejected, or cancelled requests cannot be cancelled"
      >
        <Ban className="size-3" />
        <span>Cancel</span>
      </button>
    );
  }

  return (
    <ConfirmDialog
      title="Cancel Booking Request"
      description="Are you sure you want to cancel this pending booking request? This action cannot be undone."
      confirmLabel="Cancel Request"
      variant="destructive"
      onConfirm={handleCancel}
      trigger={
        <button
          type="button"
          disabled={loading}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-400 cursor-pointer disabled:opacity-50"
          title="Cancel this pending request"
        >
          {loading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Ban className="size-3" />
          )}
          <span>Cancel</span>
        </button>
      }
    />
  );
}

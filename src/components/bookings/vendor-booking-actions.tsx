"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/core/client";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface VendorBookingActionsProps {
  id: string;
  serviceName?: string;
  customerName?: string;
}

export function VendorBookingActions({
  id,
  serviceName,
  customerName,
}: VendorBookingActionsProps) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  async function handleAccept(e: React.MouseEvent) {
    e.stopPropagation();
    setIsAccepting(true);
    try {
      const res = await apiFetch(`/bookings?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to accept booking request");
      }

      toast.success("Booking Request Accepted", {
        description: customerName
          ? `You accepted the booking for ${customerName}.`
          : "The booking has been marked as accepted.",
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to accept booking");
    } finally {
      setIsAccepting(false);
    }
  }

  async function handleReject() {
    setIsRejecting(true);
    try {
      const res = await apiFetch(`/bookings?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to reject booking request");
      }

      toast.success("Booking Request Rejected", {
        description: "The booking request has been marked as rejected.",
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to reject booking");
    } finally {
      setIsRejecting(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {/* Accept Button */}
      <button
        type="button"
        onClick={handleAccept}
        disabled={isAccepting || isRejecting}
        className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400 cursor-pointer disabled:opacity-50"
        title="Accept this booking request"
      >
        {isAccepting ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Check className="size-3" />
        )}
        <span>Accept</span>
      </button>

      {/* Reject Button with Confirmation Dialog */}
      <ConfirmDialog
        title="Reject Booking Request"
        description={`Are you sure you want to reject this booking request${serviceName ? ` for "${serviceName}"` : ""}${customerName ? ` from ${customerName}` : ""}? Once rejected, it cannot be processed again.`}
        confirmLabel="Reject Request"
        variant="destructive"
        onConfirm={handleReject}
        trigger={
          <button
            type="button"
            disabled={isAccepting || isRejecting}
            className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-400 cursor-pointer disabled:opacity-50"
            title="Reject this booking request"
          >
            {isRejecting ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <X className="size-3" />
            )}
            <span>Reject</span>
          </button>
        }
      />
    </div>
  );
}

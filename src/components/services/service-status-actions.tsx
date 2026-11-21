"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/core/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ServiceStatusActionsProps {
  id: string;
  serviceName: string;
  currentStatus?: "pending" | "approved" | "rejected";
}

export function ServiceStatusActions({
  id,
  serviceName,
  currentStatus = "pending",
}: ServiceStatusActionsProps) {
  const router = useRouter();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  async function handleApprove(e: React.MouseEvent) {
    e.stopPropagation();
    setIsApproving(true);
    try {
      const res = await apiFetch(`/services?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "approved", rejectionReason: null }),
      });

      if (!res.ok) throw new Error("Failed to approve service");

      toast.success("Service Approved", {
        description: `"${serviceName}" is now active in the public catalog.`,
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve service");
    } finally {
      setIsApproving(false);
    }
  }

  async function handleReject(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsRejecting(true);
    try {
      const res = await apiFetch(`/services?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "rejected",
          rejectionReason: rejectionReason.trim() || "Does not meet platform service criteria",
        }),
      });

      if (!res.ok) throw new Error("Failed to reject service");

      toast.success("Service Rejected", {
        description: `"${serviceName}" has been marked as rejected.`,
      });
      setRejectOpen(false);
      setRejectionReason("");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject service");
    } finally {
      setIsRejecting(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {/* Approve Button */}
      {currentStatus !== "approved" && (
        <button
          type="button"
          onClick={handleApprove}
          disabled={isApproving || isRejecting}
          className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400 cursor-pointer disabled:opacity-50"
          title="Approve Service"
          aria-label="Approve Service"
        >
          {isApproving ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Check className="size-3" />
          )}
          <span>Approve</span>
        </button>
      )}

      {/* Reject Dialog Button */}
      {currentStatus !== "rejected" && (
        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogTrigger
            onClick={(e) => {
              e.stopPropagation();
              setRejectOpen(true);
            }}
            render={
              <button
                type="button"
                disabled={isApproving || isRejecting}
                className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-400 cursor-pointer disabled:opacity-50"
                title="Reject Service"
                aria-label="Reject Service"
              >
                <X className="size-3" />
                <span>Reject</span>
              </button>
            }
          />
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Reject Service</DialogTitle>
              <DialogDescription>
                Reject &quot;{serviceName}&quot;. This service will not be visible to customers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <label htmlFor="rejectionReason" className="text-xs font-medium text-foreground">
                Rejection Reason (Optional)
              </label>
              <textarea
                id="rejectionReason"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Inappropriate images, missing pricing details, incorrect category..."
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectOpen(false)}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleReject()}
                disabled={isRejecting}
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    Rejecting...
                  </>
                ) : (
                  "Reject Service"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

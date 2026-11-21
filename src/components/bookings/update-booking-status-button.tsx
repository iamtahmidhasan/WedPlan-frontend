"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, CheckCircle2, Clock, XCircle, Ban } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/core/client";

interface UpdateBookingStatusButtonProps {
  id: string;
  currentStatus?: string;
  variant?: "button" | "badge";
  role?: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-amber-500" },
  { value: "accepted", label: "Accepted", color: "bg-emerald-500" },
  { value: "rejected", label: "Rejected", color: "bg-rose-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-muted-foreground" },
] as const;

export function UpdateBookingStatusButton({
  id,
  currentStatus = "pending",
  variant = "button",
  role,
}: UpdateBookingStatusButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const rawStatus = (currentStatus || "pending").toLowerCase();
  const status = rawStatus === "confirmed" ? "accepted" : rawStatus;

  const isCustomer = role?.toLowerCase() === "customer";
  const isVendor = role?.toLowerCase() === "vendor";
  const isAdmin = role?.toLowerCase() === "admin";

  async function handleUpdateStatus(newStatus: string) {
    if (newStatus === status) return;
    setLoading(true);

    try {
      const res = await apiFetch(`/bookings?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update status");
      }

      toast.success(
        `Booking status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`
      );
      router.refresh();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update booking status");
    } finally {
      setLoading(false);
    }
  }

  // Render static status badge
  const renderBadgeContent = () => {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
          status === "accepted" &&
            "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
          status === "pending" &&
            "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20",
          status === "rejected" &&
            "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20",
          status === "cancelled" &&
            "bg-muted text-muted-foreground border border-border"
        )}
      >
        {status === "accepted" && <CheckCircle2 className="size-3" />}
        {status === "pending" && <Clock className="size-3" />}
        {status === "rejected" && <XCircle className="size-3" />}
        {status === "cancelled" && <Ban className="size-3" />}
        <span>{status}</span>
      </span>
    );
  };

  // If explicitly badge variant, or if Customer, or if non-pending and non-admin: static badge
  if (variant === "badge" || isCustomer || (!isAdmin && status !== "pending")) {
    return renderBadgeContent();
  }

  const availableOptions = isVendor
    ? STATUS_OPTIONS.filter((opt) => opt.value === "accepted" || opt.value === "rejected")
    : STATUS_OPTIONS;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={loading}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
          status === "accepted" &&
            "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400",
          status === "pending" &&
            "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 dark:text-amber-400",
          status === "rejected" &&
            "bg-rose-500/15 text-rose-600 hover:bg-rose-500/25 dark:text-rose-400",
          status === "cancelled" &&
            "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
      >
        {loading ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <>
            {status === "accepted" && <CheckCircle2 className="size-3" />}
            {status === "pending" && <Clock className="size-3" />}
            {status === "rejected" && <XCircle className="size-3" />}
            {status === "cancelled" && <Ban className="size-3" />}
          </>
        )}
        <span>{status}</span>
        <ChevronDown className="size-3 opacity-60" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-36" onClick={(e) => e.stopPropagation()}>
        {availableOptions.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => handleUpdateStatus(opt.value)}
            className={cn(
              "cursor-pointer gap-2",
              status === opt.value && "font-semibold"
            )}
          >
            <span className={cn("size-2 rounded-full", opt.color)} />
            <span>{opt.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

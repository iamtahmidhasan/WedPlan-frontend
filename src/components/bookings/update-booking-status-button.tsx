"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, RefreshCw } from "lucide-react";
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
  { value: "confirmed", label: "Confirmed", color: "bg-emerald-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-destructive" },
] as const;

export function UpdateBookingStatusButton({
  id,
  currentStatus = "pending",
  variant = "button",
  role,
}: UpdateBookingStatusButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const status = currentStatus.toLowerCase();
  const isCustomer = role?.toLowerCase() === "customer";

  async function handleUpdateStatus(newStatus: string) {
    if (newStatus === status) return;
    setLoading(true);

    try {
      const res = await apiFetch(`/bookings?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast.success(
        `Booking status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`
      );
      router.refresh();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update booking status");
    } finally {
      setLoading(false);
    }
  }

  // If customer and status is not pending, render as static non-clickable badge
  if (isCustomer && status !== "pending") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
          status === "confirmed" &&
            "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
          status === "cancelled" &&
            "bg-destructive/15 text-destructive",
          status !== "confirmed" &&
            status !== "cancelled" &&
            "bg-amber-500/15 text-amber-600 dark:text-amber-400"
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            status === "confirmed" && "bg-emerald-500",
            status === "cancelled" && "bg-destructive",
            status !== "confirmed" && status !== "cancelled" && "bg-amber-500"
          )}
        />
        <span>{status}</span>
      </span>
    );
  }

  const availableOptions = isCustomer
    ? STATUS_OPTIONS.filter((opt) => opt.value === "pending" || opt.value === "cancelled")
    : STATUS_OPTIONS;

  return (
    <DropdownMenu>
      {variant === "badge" ? (
        <DropdownMenuTrigger
          disabled={loading}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
            status === "confirmed" &&
              "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400",
            status === "cancelled" &&
              "bg-destructive/15 text-destructive hover:bg-destructive/25",
            status !== "confirmed" &&
              status !== "cancelled" &&
              "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 dark:text-amber-400"
          )}
        >
          {loading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <span
              className={cn(
                "size-1.5 rounded-full",
                status === "confirmed" && "bg-emerald-500",
                status === "cancelled" && "bg-destructive",
                status !== "confirmed" && status !== "cancelled" && "bg-amber-500"
              )}
            />
          )}
          <span>{status}</span>
          <ChevronDown className="size-3 opacity-60" />
        </DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary cursor-pointer disabled:opacity-50 outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {loading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <RefreshCw className="size-3" />
          )}
          <span>Status</span>
          <ChevronDown className="size-3 opacity-60" />
        </DropdownMenuTrigger>
      )}

      <DropdownMenuContent align="end" className="min-w-36">
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

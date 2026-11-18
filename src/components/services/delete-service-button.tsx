"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";

export function DeleteServiceButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const res = await fetch(`${API_URL}/services/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete service");

      toast.success("Service deleted successfully");
      router.refresh();
    } catch (err) {
      console.error("Error deleting service:", err);
      toast.error("Failed to delete service");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-background px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
    >
      <Trash2 className="size-3" />
      <span>Delete</span>
    </button>
  );
}

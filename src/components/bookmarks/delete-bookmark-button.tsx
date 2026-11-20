"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { apiFetch } from "@/lib/core/client";

export function DeleteBookmarkButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    try {
      const res = await apiFetch(`/bookmarks?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete bookmark");

      toast.success("Bookmark removed successfully");
      router.refresh();
    } catch (err) {
      console.error("Error deleting bookmark:", err);
      toast.error("Failed to remove bookmark");
    }
  }

  return (
    <ConfirmDialog
      title="Remove Bookmark"
      description="Are you sure you want to remove this service from your bookmarks?"
      confirmLabel="Remove"
      onConfirm={handleDelete}
      trigger={
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-background px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
          aria-label="Remove bookmark"
        >
          <Trash2 className="size-3" />
        </button>
      }
    />
  );
}

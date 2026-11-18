"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";

export function DeleteBookmarkButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to remove this bookmark?")) return;

    try {
      const res = await fetch(`${API_URL}/bookmarks/${id}`, {
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
    <button
      type="button"
      onClick={handleDelete}
      className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-background px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
    >
      <Trash2 className="size-3" />
      <span>Remove</span>
    </button>
  );
}

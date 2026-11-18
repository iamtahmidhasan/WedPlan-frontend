"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/config";

interface BookmarkItem {
  _id?: string;
  serviceId?: string;
  userId?: string;
  userEmail?: string;
}

interface BookmarkButtonProps {
  serviceId: string;
  serviceName?: string;
  category?: string;
  price?: number;
  location?: string;
  image?: string;
  initialBookmarked?: boolean;
}

export function BookmarkButton({
  serviceId,
  serviceName,
  category,
  price,
  location,
  image,
  initialBookmarked = false,
}: BookmarkButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    fetch(`${API_URL}/bookmarks`)
      .then((res) => (res.ok ? res.json() : []))
      .then((list: BookmarkItem[]) => {
        if (Array.isArray(list)) {
          const found = list.find(
            (b) =>
              b.serviceId === serviceId &&
              (b.userId === session.user.id ||
                b.userEmail?.toLowerCase() === session.user.email?.toLowerCase())
          );
          if (found) {
            setIsBookmarked(true);
            setBookmarkId(found._id || null);
          } else {
            setIsBookmarked(false);
            setBookmarkId(null);
          }
        }
      })
      .catch((err) => console.error("Error checking bookmark:", err));
  }, [serviceId, session?.user]);

  async function handleToggleBookmark() {
    if (!session?.user) {
      toast.error("Please sign in to bookmark services");
      router.push("/sign-in");
      return;
    }

    setLoading(true);

    if (isBookmarked && bookmarkId) {
      // Remove bookmark
      try {
        const res = await fetch(`${API_URL}/bookmarks/${bookmarkId}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to remove bookmark");

        setIsBookmarked(false);
        setBookmarkId(null);
        toast.success("Bookmark removed");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Failed to remove bookmark");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Add new bookmark
    const payload = {
      serviceId,
      userId: session.user.id,
      userEmail: session.user.email,
      serviceName,
      category,
      price,
      location,
      image,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_URL}/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save bookmark");

      const data = await res.json();
      const newId = data.insertedId || data._id;
      if (newId) setBookmarkId(newId);
      setIsBookmarked(true);

      toast.success("Service added to your bookmarks!");
      router.refresh();
    } catch (err) {
      console.error("Error creating bookmark:", err);
      toast.error("Failed to bookmark service");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={isBookmarked ? "secondary" : "outline"}
      size="default"
      onClick={handleToggleBookmark}
      disabled={loading}
      className={cn(
        "gap-2 cursor-pointer h-12 px-6 transition-all",
        isBookmarked &&
          "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20"
      )}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="size-4 text-primary fill-primary/20" />
      ) : (
        <Bookmark className="size-4" />
      )}
      <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
    </Button>
  );
}

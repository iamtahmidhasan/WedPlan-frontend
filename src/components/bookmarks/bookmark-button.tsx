"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/core/client";

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
  isBlocked?: boolean;
}

export function BookmarkButton({
  serviceId,
  serviceName,
  category,
  price,
  location,
  image,
  initialBookmarked = false,
  isBlocked = false,
}: BookmarkButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sessionBlocked = Boolean(
    (session?.user as { isBlocked?: boolean } | undefined)?.isBlocked
  );
  const userIsBlocked = isBlocked ? true : sessionBlocked;

  useEffect(() => {
    if (!session?.user) return;

    apiFetch(`/bookmarks`)
      .then((res) => (res.ok ? res.json() : []))
      .then((list: BookmarkItem[]) => {
        if (Array.isArray(list)) {
          const found = list.find((b) => {
            if (b.serviceId !== serviceId) return false;
            if (session.user.id && b.userId === session.user.id) return true;
            if (session.user.email) {
              const uEmail = b.userEmail?.toLowerCase();
              const sEmail = session.user.email.toLowerCase();
              if (uEmail === sEmail) return true;
            }
            return false;
          });
          if (found) {
            setIsBookmarked(true);
            setBookmarkId(found._id ?? null);
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

    if (userIsBlocked) {
      toast.error(
        "Your account has been blocked. You cannot bookmark services."
      );
      return;
    }

    try {
      const userRes = await apiFetch(`/users`);
      if (userRes.ok) {
        const users = await userRes.json();
        if (Array.isArray(users)) {
          let matched = null;
          if (session.user.id) {
            matched = users.find(
              (u: { _id?: string; id?: string }) => u._id === session.user.id
            );
            if (!matched) {
              matched = users.find(
                (u: { _id?: string; id?: string }) => u.id === session.user.id
              );
            }
          }
          if (!matched && session.user.email) {
            const email = session.user.email.toLowerCase();
            matched = users.find(
              (u: { email?: string }) => u.email?.toLowerCase() === email
            );
          }
          if (matched?.isBlocked) {
            toast.error(
              "Your account has been blocked. You cannot bookmark services."
            );
            return;
          }
        }
      }
    } catch {
      // Continue if network fails
    }

    setLoading(true);

    if (isBookmarked && bookmarkId) {
      // Remove bookmark
      try {
        const res = await apiFetch(`/bookmarks?id=${bookmarkId}`, {
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
      const res = await apiFetch(`/bookmarks`, {
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

  if (userIsBlocked) {
    return (
      <Button
        type="button"
        variant="outline"
        size="default"
        disabled
        title="Your account is blocked. You cannot bookmark services."
        className="gap-2 cursor-not-allowed opacity-60 h-12 px-6"
      >
        <Bookmark className="size-4" />
        <span>Bookmark</span>
      </Button>
    );
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

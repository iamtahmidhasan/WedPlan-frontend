"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [user, setUser] = useState({
    name: "",
    email: "",
    image: "",
    role: "customer",
    businessName: "",
    isBlocked: false,
    emailVerified: false,
  });

  const isSessionUser = Boolean(
    (session?.user?.id && session.user.id === id) ||
    (session?.user?.email && session.user.email === user.email)
  );

  useEffect(() => {
    fetch(`http://localhost:5000/users/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setUser({
            name: data.name || "",
            email: data.email || "",
            image: data.image || "",
            role: data.role || "customer",
            businessName: data.businessName || "",
            isBlocked: Boolean(data.isBlocked),
            emailVerified: Boolean(data.emailVerified),
          });
        }
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:5000/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!res.ok) throw new Error("Failed to update user");

      toast.success("User updated successfully");
      router.push("/dashboard/users");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`http://localhost:5000/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      toast.success("User deleted successfully");
      router.push("/dashboard/users");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Users</span>
        </Link>
        <h1 className="text-2xl font-bold">User Details</h1>
        <p className="text-sm text-muted-foreground">
          View and manage account credentials, role permissions, and status.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-md border bg-card p-6 space-y-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Name */}
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              readOnly={isSessionUser}
              disabled={isSessionUser}
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className={cn(
                "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring",
                isSessionUser && "bg-muted/50 cursor-not-allowed opacity-75"
              )}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label htmlFor="image" className="text-sm font-medium">
              Profile Image URL
            </label>
            <input
              id="image"
              type="url"
              value={user.image}
              onChange={(e) => setUser({ ...user, image: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label htmlFor="role" className="text-sm font-medium">
              User Role
            </label>
            <select
              id="role"
              value={user.role}
              disabled={isSessionUser}
              onChange={(e) => setUser({ ...user, role: e.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <option value="customer">customer</option>
              <option value="vendor">vendor</option>
              <option value="admin">admin</option>
            </select>
          </div>

          {/* Business Name (Vendor only) */}
          {user.role === "vendor" && (
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="businessName" className="text-sm font-medium">
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                value={user.businessName}
                onChange={(e) =>
                  setUser({ ...user, businessName: e.target.value })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>
          )}
        </div>

        {/* Status Checkboxes */}
        {!isSessionUser && (
          <div className="flex items-center gap-6 border-t pt-4">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={user.isBlocked}
                onChange={(e) =>
                  setUser({ ...user, isBlocked: e.target.checked })
                }
                className="size-4 rounded border-input"
              />
              Blocked
            </label>

            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={user.emailVerified}
                onChange={(e) =>
                  setUser({ ...user, emailVerified: e.target.checked })
                }
                className="size-4 rounded border-input"
              />
              Email Verified
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            {!isSessionUser && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete User
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/users"
              className="rounded-md border px-4 py-2 text-sm hover:bg-secondary"
            >
              Cancel
            </Link>
            <Button type="submit">Save Changes</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

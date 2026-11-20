"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ClickableTableRow } from "@/components/dashboard/clickable-table-row";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { apiFetch } from "@/lib/core/client";

interface User {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  image?: string | null;
  role?: string;
  emailVerified?: boolean;
  isBlocked?: boolean;
  businessName?: string;
  createdAt?: string;
}

const ROLES = ["customer", "vendor", "admin"] as const;

export default function UsersPage() {
  const { data: session } = useSession();
  const sessionUserId = session?.user?.id;
  const sessionEmail = session?.user?.email;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = () => {
    apiFetch(`/users`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleUpdateUser(userId: string, updates: Partial<User>) {
    setUpdatingId(userId);

    // Optimistically update the UI
    setUsers((prev) =>
      prev.map((user) => {
        const id = user._id || user.id;
        return id === userId ? { ...user, ...updates } : user;
      })
    );

    try {
      const response = await apiFetch(`/users?id=${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      toast.success("User updated successfully");
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Failed to update user. Reverting changes.");
      fetchUsers();
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteUser(userId: string) {
    try {
      const response = await apiFetch(`/users?id=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== userId));
      toast.success("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage registered users, roles, and account access.
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email Verified</TableHead>
              <TableHead>Status (Block)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading users…
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => {
                const userId = user._id || user.id || "";
                const isCurrentlyUpdating = updatingId === userId;
                const initials = (user.name || user.email || "U")[0]?.toUpperCase();
                const isSessionUser = Boolean(
                  (sessionUserId && (userId === sessionUserId || user._id === sessionUserId || user.id === sessionUserId)) ||
                  (sessionEmail && user.email === sessionEmail)
                );

                return (
                  <ClickableTableRow
                    key={userId || index}
                    href={userId ? `/dashboard/users/${userId}` : "#"}
                  >
                    {/* User Profile */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          {user.image && (
                            <AvatarImage
                              src={user.image}
                              alt={user.name || "User"}
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <AvatarFallback className="text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <Link
                            href={userId ? `/dashboard/users/${userId}` : "#"}
                            className="font-medium text-foreground hover:underline"
                          >
                            {user.name || "N/A"}
                          </Link>
                          {user.businessName && (
                            <span className="text-[11px] text-muted-foreground">
                              {user.businessName}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell>{user.email || "N/A"}</TableCell>

                    {/* Role Update Option */}
                    <TableCell>
                      <select
                        value={user.role || "customer"}
                        disabled={isCurrentlyUpdating || isSessionUser}
                        onChange={(e) => {
                          if (userId) {
                            handleUpdateUser(userId, { role: e.target.value });
                          }
                        }}
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium capitalize outline-none transition-colors hover:bg-secondary focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </TableCell>

                    {/* Email Verified Status */}
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          user.emailVerified
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {user.emailVerified ? "Verified" : "Unverified"}
                      </span>
                    </TableCell>

                    {/* isBlocked Toggle Option (Removed/Disabled for session user) */}
                    <TableCell>
                      {isSessionUser ? (
                        <span className="text-xs text-muted-foreground font-medium">
                          Active (You)
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isCurrentlyUpdating}
                          onClick={() => {
                            if (userId) {
                              handleUpdateUser(userId, {
                                isBlocked: !user.isBlocked,
                              });
                            }
                          }}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all cursor-pointer disabled:opacity-50",
                            user.isBlocked
                              ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                              : "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400"
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              user.isBlocked ? "bg-destructive" : "bg-emerald-500"
                            )}
                          />
                          <span>{user.isBlocked ? "Blocked" : "Active"}</span>
                        </button>
                      )}
                    </TableCell>

                    {/* Action Buttons (Delete) */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {userId && !isSessionUser && (
                          <ConfirmDialog
                            title="Delete User"
                            description="Are you sure you want to delete this user? All their associated data may be permanently removed."
                            confirmLabel="Delete User"
                            onConfirm={() => handleDeleteUser(userId)}
                            trigger={
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-background px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
                              >
                                <Trash2 className="size-3" />
                                <span>Delete</span>
                              </button>
                            }
                          />
                        )}
                      </div>
                    </TableCell>
                  </ClickableTableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

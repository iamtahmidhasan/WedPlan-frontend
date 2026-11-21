"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { Plus, Tags, Trash2, ShieldAlert, Sparkles, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/core/client";
import { ImageUpload } from "@/components/ui/image-upload";

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  createdAt?: string;
}

interface Service {
  _id: string;
  category?: string;
  categoryId?: string;
}

export default function AdminCategoriesPage() {
  const { data: session, isPending } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load categories and services
  const refreshData = async () => {
    try {
      const [catRes, servRes] = await Promise.all([
        apiFetch("/categories"),
        apiFetch("/services"),
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        if (Array.isArray(catData)) setCategories(catData);
      }
      if (servRes.ok) {
        const servData = await servRes.json();
        if (Array.isArray(servData)) setServices(servData);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      apiFetch("/categories"),
      apiFetch("/services"),
    ])
      .then(async ([catRes, servRes]) => {
        if (!isMounted) return;
        if (catRes.ok) {
          const catData = await catRes.json();
          if (Array.isArray(catData)) setCategories(catData);
        }
        if (servRes.ok) {
          const servData = await servRes.json();
          if (Array.isArray(servData)) setServices(servData);
        }
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate service count per category
  const getServiceCount = (cat: Category) => {
    return services.filter(
      (s) => s.categoryId === cat._id || s.category?.toLowerCase() === cat.name.toLowerCase()
    ).length;
  };

  // Create new category
  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch("/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          image: image.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to create category");
        return;
      }

      toast.success(`Category "${name}" created successfully`);
      setName("");
      setDescription("");
      setImage("");
      setShowAddForm(false);
      refreshData();
    } catch {
      toast.error("Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id: string, catName: string) => {
    try {
      const res = await apiFetch(`/categories/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to delete category");
        return;
      }

      toast.success(`Category "${catName}" deleted`);
      setCategories(categories.filter((c) => c._id !== id));
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const userRole = (session?.user as { role?: string } | undefined)?.role;

  if (!isPending && userRole !== "admin") {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-6">
        <ShieldAlert className="size-12 text-destructive mb-3" />
        <h2 className="text-xl font-bold">Admin Access Required</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Only platform administrators have permission to manage wedding categories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Tags className="size-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Category Management</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage wedding specialties used by vendors when creating services.
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-fit"
        >
          <Plus className="mr-1.5 size-4" />
          {showAddForm ? "Close Form" : "Add Category"}
        </Button>
      </div>

      {/* Add Category Form Card */}
      {showAddForm && (
        <form
          onSubmit={handleCreateCategory}
          className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2 text-primary font-semibold text-base">
            <Sparkles className="size-4" />
            <span>Create New Wedding Category</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-1">
              <label htmlFor="catName" className="text-sm font-medium">
                Category Name <span className="text-destructive">*</span>
              </label>
              <input
                id="catName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bridal Wear & Jewelry"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="sm:col-span-1">
              <ImageUpload
                value={image}
                onChange={(url) => setImage(url)}
                label="Cover Image (Optional)"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="catDesc" className="text-sm font-medium">
                Description (Optional)
              </label>
              <textarea
                id="catDesc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of wedding services offered in this category..."
                className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Create Category"}
            </Button>
          </div>
        </form>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <FolderTree className="mx-auto size-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No categories found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Click &quot;Add Category&quot; above to create your first wedding service category.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const count = getServiceCount(cat);
            return (
              <div
                key={cat._id}
                className="flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5 shadow-xs transition hover:border-primary/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative size-12 overflow-hidden rounded-lg border bg-secondary shrink-0">
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-primary">
                          <Tags className="size-6" />
                        </div>
                      )}
                    </div>
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {count} {count === 1 ? "service" : "services"}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-foreground mt-3">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {cat.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    ID: {cat._id.slice(-6)}
                  </span>
                  <ConfirmDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2"
                        disabled={count > 0}
                      >
                        <Trash2 className="size-3.5 mr-1" />
                        <span>Delete</span>
                      </Button>
                    }
                    title="Delete Category?"
                    description={
                      count > 0
                        ? `Cannot delete "${cat.name}" because it currently has ${count} assigned service(s). Reassign or remove services first.`
                        : `Are you sure you want to delete "${cat.name}"? Vendors will no longer be able to select it.`
                    }
                    confirmLabel="Delete Category"
                    onConfirm={() => handleDeleteCategory(cat._id, cat.name)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

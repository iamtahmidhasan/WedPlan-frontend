"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { apiFetch } from "@/lib/core/client";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";

export default function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [service, setService] = useState({
    serviceName: "",
    category: "",
    categoryId: "",
    price: 0,
    location: "",
    description: "",
    images: [] as string[],
  });

  useEffect(() => {
    apiFetch(`/services?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setService({
            serviceName: data.serviceName || "",
            category: data.category || "",
            categoryId: data.categoryId || "",
            price: Number(data.price) || 0,
            location: data.location || "",
            description: data.description || "",
            images: Array.isArray(data.images)
              ? data.images
              : data.image
                ? [data.image]
                : [],
          });
        }
      })
      .catch((err) => console.error("Error fetching service:", err));

    apiFetch("/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const payload = {
      serviceName: service.serviceName.trim(),
      category: service.category.trim(),
      categoryId: service.categoryId,
      price: Number(service.price),
      location: service.location.trim(),
      description: service.description.trim(),
      images: service.images,
    };

    try {
      const res = await apiFetch(`/services?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update service");

      toast.success("Service updated successfully");
      router.push("/dashboard/services");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update service");
    }
  }

  async function handleDelete() {
    try {
      const res = await apiFetch(`/services?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete service");

      toast.success("Service deleted successfully");
      router.push("/dashboard/services");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete service");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/dashboard/services"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Services</span>
        </Link>
        <h1 className="text-2xl font-bold">Service Details</h1>
        <p className="text-sm text-muted-foreground">
          View and edit service specifications, pricing, and coverage details.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-md border bg-card p-6 space-y-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Service Name */}
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="serviceName" className="text-sm font-medium">
              Service Name
            </label>
            <input
              id="serviceName"
              type="text"
              required
              value={service.serviceName}
              onChange={(e) =>
                setService({ ...service, serviceName: e.target.value })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label htmlFor="category" className="text-sm font-medium">
              Category <span className="text-destructive">*</span>
            </label>
            <select
              id="category"
              required
              value={service.category}
              onChange={(e) => {
                const selectedCat = categories.find((c) => c.name === e.target.value);
                setService({
                  ...service,
                  category: e.target.value,
                  categoryId: selectedCat?._id || service.categoryId,
                });
              }}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            >
              <option value="" disabled>Select a wedding category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              {service.category && !categories.some((c) => c.name === service.category) && (
                <option value={service.category}>{service.category}</option>
              )}
            </select>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label htmlFor="price" className="text-sm font-medium">
              Price ($)
            </label>
            <input
              id="price"
              type="number"
              required
              min={0}
              value={service.price}
              onChange={(e) =>
                setService({ ...service, price: Number(e.target.value) })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Location */}
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={service.location}
              onChange={(e) =>
                setService({ ...service, location: e.target.value })
              }
              placeholder="e.g. Napa Valley, CA"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Cover & Gallery Images */}
          <div className="space-y-1 sm:col-span-2">
            <MultiImageUpload
              values={service.images}
              onChange={(urls) =>
                setService({ ...service, images: urls })
              }
              label="Service Images (First image is primary Cover)"
            />
          </div>

          {/* Description */}
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={service.description}
              onChange={(e) =>
                setService({ ...service, description: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <ConfirmDialog
            title="Delete Service"
            description="Are you sure you want to delete this service? This action cannot be undone."
            confirmLabel="Delete Service"
            onConfirm={handleDelete}
            trigger={
              <Button type="button" variant="destructive">
                Delete Service
              </Button>
            }
          />

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/services"
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

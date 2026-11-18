import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function AddServicePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  async function createService(formData: FormData) {
    "use server";

    const currentSession = await auth.api.getSession({
      headers: await headers(),
    });

    const payload = {
      serviceName: formData.get("serviceName"),
      category: formData.get("category"),
      price: Number(formData.get("price")) || 0,
      location: formData.get("location"),
      description: formData.get("description"),
      images: formData.get("image") ? [formData.get("image")] : [],
      vendorId: currentSession?.user?.id || user?.id || "vendor",
      createdAt: new Date().toISOString(),
    };

    await fetch("http://localhost:5000/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    redirect("/dashboard/services");
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">Add Service</h1>
            <p className="text-sm text-muted-foreground">
              Create and publish a new service to the catalog.
            </p>
          </div>
          {user && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary w-fit">
              <Store className="size-3.5" />
              <span>Vendor: {user.name || user.email}</span>
            </span>
          )}
        </div>
      </div>

      <form action={createService} className="rounded-md border bg-card p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Service Name */}
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="serviceName" className="text-sm font-medium">
              Service Name
            </label>
            <input
              id="serviceName"
              name="serviceName"
              type="text"
              required
              placeholder="e.g. Royal Grand Reception"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <input
              id="category"
              name="category"
              type="text"
              required
              placeholder="e.g. Venue, Photography, Florist"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label htmlFor="price" className="text-sm font-medium">
              Price ($)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              required
              min={0}
              placeholder="e.g. 2500"
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
              name="location"
              type="text"
              required
              placeholder="e.g. Napa Valley, CA"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Cover Image URL */}
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="image" className="text-sm font-medium">
              Cover Image URL
            </label>
            <input
              id="image"
              name="image"
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Description */}
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Details about this service package..."
              className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Link
            href="/dashboard/services"
            className="rounded-md border px-4 py-2 text-sm hover:bg-secondary"
          >
            Cancel
          </Link>
          <Button type="submit">Create Service</Button>
        </div>
      </form>
    </div>
  );
}

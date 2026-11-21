import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { apiFetch } from "@/lib/core/server";
import { checkIsUserBlocked } from "@/lib/user-status";
import { getPremiumById } from "@/lib/actions/getPremiumById";
import { ServiceImageUpload } from "@/components/services/service-image-upload";

export default async function AddServicePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  const categoriesRes = await apiFetch("/categories", { cache: "no-store" }).catch(() => null);
  const categories: { _id: string; name: string }[] = categoriesRes?.ok ? await categoriesRes.json() : [];

  async function createService(formData: FormData) {
    "use server";

    const currentSession = await auth.api.getSession({
      headers: await headers(),
    });

    const isBlocked = await checkIsUserBlocked(currentSession?.user);
    if (isBlocked) {
      throw new Error("Your account has been blocked.");
    }

    const currentUserId = currentSession?.user?.id ?? user?.id ?? "vendor";

    if (currentSession?.user?.role === "vendor") {
      const servicesRes = await apiFetch(`/services`, {
        cache: "no-store",
      });
      const services: { vendorId: string }[] = servicesRes.ok
        ? await servicesRes.json()
        : [];
      const count = services.filter(
        (service) => service.vendorId === currentUserId,
      ).length;
      const premium = await getPremiumById({
        userId: currentUserId,
      }).catch(() => null);

      if (count >= 3 && !premium?.isPremium) redirect("/premium");
    }

    const selection = (formData.get("categorySelection") as string) || "";
    const [categoryId, categoryName] = selection.includes(":::")
      ? selection.split(":::")
      : ["", selection];

    const rawImagesJson = (formData.get("imagesJson") as string) || "";
    let images: string[] = [];
    try {
      if (rawImagesJson) images = JSON.parse(rawImagesJson);
    } catch {
      images = [];
    }

    const payload = {
      serviceName: formData.get("serviceName"),
      category: categoryName,
      categoryId: categoryId,
      price: Number(formData.get("price")) || 0,
      location: formData.get("location"),
      description: formData.get("description"),
      images,
      vendorId: currentUserId,
      createdAt: new Date().toISOString(),
    };

    await apiFetch(`/services`, {
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
            <label htmlFor="categorySelection" className="text-sm font-medium">
              Category <span className="text-destructive">*</span>
            </label>
            <select
              id="categorySelection"
              name="categorySelection"
              required
              defaultValue=""
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            >
              <option value="" disabled>Select a wedding category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={`${cat._id}:::${cat.name}`}>
                  {cat.name}
                </option>
              ))}
            </select>
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

          {/* Cover Image */}
          <ServiceImageUpload />

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

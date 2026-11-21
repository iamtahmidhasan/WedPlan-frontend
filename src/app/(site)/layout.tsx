import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FloatingChatBot } from "@/components/chat/floating-chatbot";
import { apiFetch } from "@/lib/core/server";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [servicesRes, categoriesRes] = await Promise.all([
    apiFetch("/services", { cache: "no-store" }).catch(() => null),
    apiFetch("/categories", { cache: "no-store" }).catch(() => null),
  ]);

  const services: { category?: string; status?: string }[] = servicesRes?.ok ? await servicesRes.json() : [];
  const categoriesList: { name: string }[] = categoriesRes?.ok ? await categoriesRes.json() : [];

  const serviceCategories = new Set(
    services
      .filter((s) => !s.status || s.status === "approved")
      .map((s) => s.category?.trim().toLowerCase())
      .filter(Boolean)
  );

  const categories = categoriesList
    .map((c) => c.name)
    .filter((name) => serviceCategories.size === 0 || serviceCategories.has(name.toLowerCase()));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header mode="solid" />
      <div className="min-h-0 flex-1 pt-16">{children}</div>
      <Footer categories={categories} />
      <FloatingChatBot />
    </div>
  );
}

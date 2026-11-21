import { HeroSection } from "@/components/home/hero-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedSection } from "@/components/home/featured-section";
import { WhyChooseSection } from "@/components/home/why-choose-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { apiFetch } from "@/lib/core/server";

export default async function Home() {
  const [servicesRes, categoriesRes] = await Promise.all([
    apiFetch("/services", { cache: "no-store" }).catch(() => null),
    apiFetch("/categories", { cache: "no-store" }).catch(() => null),
  ]);

  const services: { category?: string; status?: string }[] = servicesRes?.ok ? await servicesRes.json() : [];
  const categoriesList: { name: string }[] = categoriesRes?.ok ? await categoriesRes.json() : [];

  const existingServiceCats = new Set(
    services
      .filter((s) => !s.status || s.status === "approved")
      .map((s) => s.category?.trim().toLowerCase())
      .filter(Boolean)
  );

  const categories = categoriesList
    .map((c) => c.name)
    .filter((name) => existingServiceCats.size === 0 || existingServiceCats.has(name.toLowerCase()));

  return (
    <>
      <HeroSection />
      <CategoriesSection categories={categories} />
      <FeaturedSection />
      <WhyChooseSection />
      <HowItWorksSection />
    </>
  );
}

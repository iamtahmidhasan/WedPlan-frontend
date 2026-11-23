import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";
import { FloatingChatBot } from "@/components/chat/floating-chatbot";
import { apiFetch } from "@/lib/core/server";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WedPlan — Wedding Planning Platform",
    template: "%s | WedPlan",
  },
  description:
    "WedPlan is the premier wedding planning platform connecting couples with verified wedding venues, photographers, caterers, florists, and stylists.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [servicesRes, categoriesRes] = await Promise.all([
    apiFetch("/services", { cache: "no-store" }).catch(() => null),
    apiFetch("/categories", { cache: "no-store" }).catch(() => null),
  ]);

  const services: { category?: string; status?: string }[] = servicesRes?.ok
    ? await servicesRes.json()
    : [];
  const categoriesList: { name: string }[] = categoriesRes?.ok
    ? await categoriesRes.json()
    : [];

  const serviceCategories = new Set(
    services
      .filter((s) => !s.status || s.status === "approved")
      .map((s) => s.category?.trim().toLowerCase())
      .filter(Boolean),
  );

  const categories = categoriesList
    .map((c) => c.name)
    .filter(
      (name) =>
        serviceCategories.size === 0 ||
        serviceCategories.has(name.toLowerCase()),
    );
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        dmSans.variable,
        cormorantGaramond.variable,
        geistMono.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader
            color="#0f766e"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #0f766e,0 0 5px #0f766e"
          />
          {children}
          <Footer categories={categories} />
          <FloatingChatBot />
          <Toaster position="bottom-right" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}

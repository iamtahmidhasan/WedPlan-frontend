import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header mode="solid" />
      <div className="min-h-0 flex-1 pt-16">{children}</div>
      <Footer />
    </div>
  );
}

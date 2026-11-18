import type { ReactNode } from "react";
import { Header } from "@/components/header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header mode="solid" />
      <div className="min-h-0 flex-1 pt-16">{children}</div>
    </>
  );
}

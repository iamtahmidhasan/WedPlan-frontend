import type { ReactNode } from "react";
import { Header } from "@/components/header";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header mode="overlay" />
      <div className="min-h-0 flex-1">{children}</div>
    </>
  );
}

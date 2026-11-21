"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

export function ThemeToggle({
  isTransparent = false,
  className,
}: {
  isTransparent?: boolean;
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div
        className={cn(
          "size-9 rounded-md border border-transparent p-2",
          className,
        )}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex size-9 items-center justify-center text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
        isTransparent && "border-transparent",
        className,
      )}
    >
      {isDark ? (
        <Sun className="size-4.5 transition-transform" />
      ) : (
        <Moon className="size-4.5 transition-transform" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

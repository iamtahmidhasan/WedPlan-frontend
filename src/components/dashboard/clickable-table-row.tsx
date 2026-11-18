"use client";

import { useRouter } from "next/navigation";
import { TableRow } from "@/components/ui/table";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface ClickableTableRowProps extends ComponentProps<typeof TableRow> {
  href: string;
}

export function ClickableTableRow({
  href,
  className,
  children,
  onClick,
  ...props
}: ClickableTableRowProps) {
  const router = useRouter();

  return (
    <TableRow
      {...props}
      className={cn("cursor-pointer hover:bg-muted/50 transition-colors", className)}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("button, select, a, input, [role='menuitem']")) {
          return;
        }
        onClick?.(e);
        router.push(href);
      }}
    >
      {children}
    </TableRow>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found | WedPlan",
  description: "The page you’re looking for isn’t part of your plan.",
};

export default function NotFound() {
  return (
    <main className="grid min-h-[calc(100svh-4rem)] bg-background lg:min-h-[100svh] lg:grid-cols-[minmax(18rem,0.8fr)_minmax(30rem,1.2fr)]">
      <aside className="relative flex min-h-56 flex-col justify-between overflow-hidden bg-primary p-6 text-primary-foreground sm:p-10 lg:min-h-[100svh] lg:p-14">
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="font-heading text-3xl tracking-[-0.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
          >
            WedPlan
          </Link>
          <span className="text-sm text-primary-foreground/70">A small detour</span>
        </div>

        <div className="relative z-10 py-10 lg:py-0">
          <p className="font-heading text-7xl leading-none tracking-[-0.04em] sm:text-8xl">
            404
          </p>
          <p className="mt-4 max-w-[24ch] font-heading text-3xl leading-tight sm:text-4xl">
            This page has moved on.
          </p>
        </div>

        <p className="relative z-10 text-sm text-primary-foreground/70">
          The good part is still right where you left it.
        </p>

        <div
          className="absolute -bottom-28 -right-20 size-80 rounded-full border border-primary-foreground/20"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-16 -right-8 size-56 rounded-full border border-primary-foreground/15"
          aria-hidden="true"
        />
      </aside>

      <section className="flex items-center justify-center border-t border-border px-6 py-12 sm:px-10 lg:border-t-0 lg:px-20">
        <div className="w-full max-w-md">
          <p className="mb-3 text-sm text-muted-foreground">Page not found</p>
          <h1 className="max-w-[14ch] text-5xl leading-[0.98] tracking-[-0.03em] text-foreground sm:text-6xl">
            This isn’t in the plan.
          </h1>
          <p className="mt-5 max-w-[42ch] text-base leading-7 text-muted-foreground">
            The link may have changed, or the page may never have existed. Your
            plans are safe and sound.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              render={<Link href="/" />}
              className="h-12 w-full gap-2 rounded-md px-5 text-sm sm:w-auto"
            >
              <ArrowLeft aria-hidden="true" />
              Back to home
            </Button>
            <Button
              variant="outline"
              render={<Link href="/#vendors" />}
              className="h-12 w-full gap-2 rounded-md border-border bg-background px-5 text-sm hover:bg-secondary sm:w-auto"
            >
              <Compass aria-hidden="true" />
              Explore vendors
            </Button>
          </div>

          <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
            If you followed a link from a message, double-check the URL.
          </p>
        </div>
      </section>
    </main>
  );
}

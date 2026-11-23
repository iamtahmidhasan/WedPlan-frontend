import Link from "next/link";
import { ArrowLeft, Sparkles, HelpCircle } from "lucide-react";

export default function ServiceNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-24 bg-background">
      <div className="w-full max-w-lg text-center rounded-2xl border border-border bg-card p-8 sm:p-12 shadow-sm">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HelpCircle className="size-8" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          404 Not Found
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Service Not Found
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          The service ID you provided is invalid, does not exist, or has been unpublished by its vendor. Please verify the URL or explore our curated directory of wedding services.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/services"
            className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Sparkles className="size-4" />
            <span>Browse All Services</span>
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-input bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

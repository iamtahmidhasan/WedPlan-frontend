import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="grid min-h-[100svh] bg-background lg:grid-cols-[minmax(18rem,0.8fr)_minmax(30rem,1.2fr)]">
      <aside className="relative flex min-h-56 flex-col justify-between overflow-hidden bg-primary p-6 text-primary-foreground sm:p-10 lg:p-14">
        <div className="relative z-10 mt-12 lg:mt-8">
          <span className="text-sm text-primary-foreground/70">Est. for your day</span>
        </div>

        <div className="relative z-10 max-w-sm py-12 lg:py-0">
          <p className="mb-4 text-sm text-primary-foreground/70">
            A quieter way to plan.
          </p>
          <p className="font-heading text-4xl leading-[1.05] tracking-[-0.02em] sm:text-5xl">
            Find the right people for the day you have been imagining.
          </p>
        </div>

        <p className="relative z-10 text-sm text-primary-foreground/70">
          Discover vendors. Start conversations. Keep the details close.
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

      <section className="flex items-center justify-center px-6 pt-24 pb-12 sm:px-10 lg:px-20">
        {children}
      </section>
    </main>
  );
}

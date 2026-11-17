"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut, useSession } from "@/lib/auth-client";

const navigation = [
  { label: "Discover", href: "/" },
  { label: "Vendors", href: "/#vendors" },
  { label: "Bookings", href: "/#bookings" },
  { label: "Saved", href: "/#saved" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

type User = NonNullable<ReturnType<typeof useSession>["data"]>["user"];

type AccountMenuProps = {
  user: User;
  isSigningOut: boolean;
  onSignOut: () => void;
};

function AccountMenu({ user, isSigningOut, onSignOut }: AccountMenuProps) {
  const displayName = user?.name || user?.email || "Your account";
  const initials = getInitials(user?.name || user?.email || "U");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-full p-1 outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Open account menu for ${displayName}`}
      >
        <Avatar>
          {user.image && (
            <AvatarImage src={user.image} alt="" referrerPolicy="no-referrer" />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="space-y-0.5">
            <span className="block truncate text-foreground">{displayName}</span>
            {user.name && (
              <span className="block truncate font-normal">{user.email}</span>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isSigningOut}
          onClick={onSignOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut aria-hidden="true" />
          {isSigningOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LoadingAccount() {
  return (
    <div
      className="size-9 rounded-full bg-muted motion-safe:animate-pulse motion-reduce:animate-none"
      aria-label="Loading account"
      role="status"
    />
  );
}

function AuthActions({
  onNavigate,
  stacked = false,
}: {
  onNavigate?: () => void;
  stacked?: boolean;
}) {
  return (
    <div className={stacked ? "grid gap-2" : "grid gap-2 sm:flex"}>
      <Link
        href="/sign-in"
        onClick={onNavigate}
        className="flex h-11 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        onClick={onNavigate}
        className="flex h-11 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Create account
      </Link>
    </div>
  );
}

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary">
      <ul className="space-y-1">
        {navigation.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className="block rounded-md px-3 py-2 text-base text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Header() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const user = session?.user;

  async function handleSignOut() {
    setSignOutError("");
    setIsSigningOut(true);

    const result = await signOut();

    if (result.error) {
      setSignOutError(
        result.error.message || "We couldn’t sign you out. Please try again."
      );
      setIsSigningOut(false);
      return;
    }

    router.replace("/sign-in");
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-background px-8 py-8 lg:flex">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex size-10 items-center justify-center rounded-full bg-foreground font-heading text-xl text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="WedPlan home"
          >
            W.
          </Link>
          {isPending ? (
            <LoadingAccount />
          ) : (
            user && (
              <AccountMenu
                user={user}
                isSigningOut={isSigningOut}
                onSignOut={handleSignOut}
              />
            )
          )}
        </div>

        <div className="mt-32">
          <p className="mb-4 px-3 text-sm text-muted-foreground">Plan together</p>
          <NavigationLinks />
        </div>

        <div className="mt-auto space-y-5">
          <p className="px-3 text-sm text-muted-foreground">
            Find the people who make the day yours.
          </p>
          {!isPending && !user && <AuthActions stacked />}
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-6 lg:hidden">
        <Link
          href="/"
          className="flex size-9 items-center justify-center rounded-full bg-foreground font-heading text-lg text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="WedPlan home"
        >
          W.
        </Link>
        <div className="flex items-center gap-2">
          {isPending ? (
            <LoadingAccount />
          ) : (
            user && (
              <AccountMenu
                user={user}
                isSigningOut={isSigningOut}
                onSignOut={handleSignOut}
              />
            )
          )}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger
              className="flex size-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMenuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </SheetTrigger>
            <SheetContent
              side="top"
              overlayClassName="top-16"
              showCloseButton={false}
              className="!top-16 !bottom-0 !left-0 !right-0 !h-[calc(100dvh-4rem)] w-full max-w-none border-b-0 p-0 lg:hidden"
            >
              <SheetHeader className="border-b border-border px-6 py-5 text-left">
                <SheetTitle className="font-heading text-2xl">WedPlan</SheetTitle>
                <SheetDescription>
                  Make room for the good part.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 px-6 py-8">
                <NavigationLinks onNavigate={() => setIsMenuOpen(false)} />
              </div>
              {!isPending && !user && (
                <div className="border-t border-border px-6 py-6">
                  <AuthActions onNavigate={() => setIsMenuOpen(false)} />
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>
      {signOutError && (
        <p className="sr-only" role="alert">
          {signOutError}
        </p>
      )}
    </>
  );
}

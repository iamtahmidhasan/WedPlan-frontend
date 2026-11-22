"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { LoaderCircle, Check, Circle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { signIn, signUp, authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type AuthMode = "sign-in" | "sign-up";

type AuthFormProps = {
  mode: AuthMode;
};

const copy = {
  "sign-in": {
    title: "Welcome back to your plans.",
    description:
      "Keep every conversation, booking, and beautiful detail close at hand.",
    submitLabel: "Sign in",
    successTitle: "Welcome back.",
    successDescription: "Your plans are ready when you are.",
    errorTitle: "Couldn’t sign in",
    alternatePrompt: "New to WedPlan?",
    alternateLabel: "Create an account",
    alternateHref: "/sign-up",
  },
  "sign-up": {
    title: "Make room for the good part.",
    description:
      "Bring your wedding plans, trusted vendors, and next steps together.",
    submitLabel: "Create account",
    successTitle: "Welcome to WedPlan.",
    successDescription: "Your account is ready. Let’s start planning.",
    errorTitle: "Couldn’t create your account",
    alternatePrompt: "Already have an account?",
    alternateLabel: "Sign in",
    alternateHref: "/sign-in",
  },
} as const;

function getErrorMessage(error: { message?: string } | null | undefined) {
  return (
    error?.message ?? "We couldn’t complete that request. Please try again."
  );
}

function getDestinationForRole(
  role?: string,
  fallbackRedirect?: string | null,
): string {
  if (
    fallbackRedirect &&
    fallbackRedirect.startsWith("/") &&
    !fallbackRedirect.startsWith("//")
  ) {
    return fallbackRedirect;
  }
  if (role === "admin") {
    return "/dashboard/users";
  }
  if (role === "vendor") {
    return "/dashboard/services";
  }
  return "/dashboard";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam =
    searchParams.get("redirect") || searchParams.get("callbackUrl");

  const content = copy[mode];
  const isSignUp = mode === "sign-up";
  const [name, setName] = useState("");
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [businessName, setBusinessName] = useState("");
  const [image, setImage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);

  // Password validation criteria
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (isSignUp) {
      if (!hasMinLength) {
        const msg = "Password must be at least 6 characters long.";
        setErrorMessage(msg);
        toast.error("Weak Password", { description: msg });
        return;
      }
      if (!hasUppercase) {
        const msg = "Password must contain at least one uppercase letter.";
        setErrorMessage(msg);
        toast.error("Weak Password", { description: msg });
        return;
      }
      if (!hasLowercase) {
        const msg = "Password must contain at least one lowercase letter.";
        setErrorMessage(msg);
        toast.error("Weak Password", { description: msg });
        return;
      }
    }

    setIsSubmitting(true);

    const signupTarget = getDestinationForRole(role, redirectParam);

    const result = isSignUp
      ? await (
          signUp.email as (data: {
            name: string;
            email: string;
            password: string;
            role: "customer" | "vendor";
            businessName?: string;
            image?: string;
            callbackURL?: string;
          }) => Promise<{ error?: { message?: string } }>
        )({
          name,
          email,
          password,
          role,
          businessName:
            role === "vendor" ? businessName.trim() || undefined : undefined,
          image: image.trim() || undefined,
          callbackURL: signupTarget,
        })
      : await signIn.email({
          email,
          password,
          callbackURL: redirectParam || "/dashboard",
        });

    if (result.error) {
      const message = getErrorMessage(result.error);
      setErrorMessage(message);
      toast.error(content.errorTitle, { description: message });
      setIsSubmitting(false);
      return;
    }

    toast.success(content.successTitle, {
      description: content.successDescription,
    });

    if (isSignUp) {
      router.replace(signupTarget);
      router.refresh();
    } else {
      // Determine user role post sign-in
      try {
        const sessionRes = await authClient.getSession();
        const userRole = (sessionRes?.data?.user as { role?: string })?.role;
        const target = getDestinationForRole(userRole, redirectParam);
        router.replace(target);
        router.refresh();
      } catch {
        router.replace(redirectParam || "/dashboard");
        router.refresh();
      }
    }
  }

  async function handleGoogleSignIn() {
    setErrorMessage("");
    setIsSigningInWithGoogle(true);

    const target = redirectParam || "/dashboard";
    const result = await signIn.social({
      provider: "google",
      callbackURL: target,
    });

    if (result?.error) {
      const message = getErrorMessage(result.error);
      setErrorMessage(message);
      toast.error("Couldn’t continue with Google", { description: message });
      setIsSigningInWithGoogle(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <p className="mb-3 text-sm text-muted-foreground">
          Your plans, together.
        </p>
        <h1 className="max-w-[14ch] text-5xl leading-[0.98] tracking-[-0.03em] text-foreground sm:text-6xl">
          {content.title}
        </h1>
        <p className="mt-5 max-w-[42ch] text-base leading-7 text-muted-foreground">
          {content.description}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full gap-3 rounded-md border-border bg-background text-sm font-medium hover:bg-secondary active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
          onClick={handleGoogleSignIn}
          disabled={isSigningInWithGoogle || isSubmitting}
        >
          {isSigningInWithGoogle ? (
            <LoaderCircle
              className="size-4 motion-safe:animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <svg
              className="size-4 shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          Continue with Google
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>or use your email</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {isSignUp && (
          <>
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Your name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-12 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground hover:bg-secondary focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                placeholder="Alex Morgan"
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["customer", "vendor"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      "h-11 rounded-md border text-sm font-medium capitalize transition-all",
                      role === r
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-input bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {r === "customer" ? "Plan my wedding" : "List my services"}
                  </button>
                ))}
              </div>
            </div>

            {role === "vendor" && (
              <div className="space-y-2">
                <label
                  htmlFor="businessName"
                  className="text-sm font-medium text-foreground"
                >
                  Business name
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  className="h-12 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground hover:bg-secondary focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                  placeholder="e.g. Blossom Florals, Elite Venues"
                  required
                  aria-required="true"
                />
              </div>
            )}

            <ImageUpload value={image} onChange={setImage} />
          </>
        )}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground hover:bg-secondary focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            placeholder="you@example.com"
            required
            aria-required="true"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            {!isSignUp && (
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground hover:bg-secondary focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            placeholder="Enter your password"
            required
            aria-required="true"
            minLength={6}
          />

          {isSignUp && (
            <div className="rounded-md border border-border/60 bg-muted/30 p-3 space-y-1.5 text-xs">
              <p className="font-medium text-muted-foreground">
                Password requirements:
              </p>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
                <span
                  className={cn(
                    "flex items-center gap-1.5 transition-colors",
                    hasMinLength
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {hasMinLength ? (
                    <Check className="size-3.5 shrink-0" />
                  ) : (
                    <Circle className="size-2 shrink-0 fill-current opacity-40" />
                  )}
                  6+ characters
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1.5 transition-colors",
                    hasUppercase
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {hasUppercase ? (
                    <Check className="size-3.5 shrink-0" />
                  ) : (
                    <Circle className="size-2 shrink-0 fill-current opacity-40" />
                  )}
                  1 uppercase (A-Z)
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1.5 transition-colors",
                    hasLowercase
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {hasLowercase ? (
                    <Check className="size-3.5 shrink-0" />
                  ) : (
                    <Circle className="size-2 shrink-0 fill-current opacity-40" />
                  )}
                  1 lowercase (a-z)
                </span>
              </div>
            </div>
          )}
        </div>

        {errorMessage && (
          <p
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <Button
          type="submit"
          className={cn(
            "h-12 w-full rounded-md text-sm active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55",
            isSubmitting && "cursor-wait",
          )}
          disabled={
            isSubmitting ||
            isSigningInWithGoogle ||
            (isSignUp && !isPasswordValid)
          }
        >
          {isSubmitting && (
            <LoaderCircle
              className="size-4 motion-safe:animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {isSubmitting ? "Working…" : content.submitLabel}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {content.alternatePrompt}{" "}
        <Link
          href={content.alternateHref}
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {content.alternateLabel}
        </Link>
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { signIn, signUp } from "@/lib/auth-client";
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

const githubErrorTitle = "Couldn’t continue with GitHub";

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
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
  const [isSigningInWithGithub, setIsSigningInWithGithub] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

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
          callbackURL: "/",
        })
      : await signIn.email({
          email,
          password,
          callbackURL: "/",
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
    router.replace("/");
  }

  async function handleGithubSignIn() {
    setErrorMessage("");
    setIsSigningInWithGithub(true);

    const result = await signIn.social({
      provider: "github",
      callbackURL: "/",
    });

    if (result.error) {
      const message = getErrorMessage(result.error);
      setErrorMessage(message);
      toast.error(githubErrorTitle, { description: message });
      setIsSigningInWithGithub(false);
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

      <div className="mb-6">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full gap-3 rounded-md border-border bg-background text-sm hover:bg-secondary active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
          onClick={handleGithubSignIn}
          disabled={isSigningInWithGithub || isSubmitting}
        >
          {isSigningInWithGithub && (
            <LoaderCircle
              className="size-4 motion-safe:animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          Continue with GitHub
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
            minLength={8}
          />
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
          disabled={isSubmitting || isSigningInWithGithub}
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

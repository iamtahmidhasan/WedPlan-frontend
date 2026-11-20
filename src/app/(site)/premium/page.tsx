import type { Metadata } from "next";
import { headers } from "next/headers";
import { AuthShell } from "@/components/auth/auth-shell";
import { PremiumCheckout } from "@/components/premium/premium-checkout";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Upgrade to Premium | WedPlan",
  description:
    "Unlock unlimited wedding service bookings with a simple one-time payment.",
};

export default async function PremiumPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isVendor = session?.user?.role === "vendor";

  return (
    <AuthShell>
      <PremiumCheckout isVendor={isVendor} />
    </AuthShell>
  );
}

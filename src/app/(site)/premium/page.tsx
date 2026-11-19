import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { PremiumCheckout } from "@/components/premium/premium-checkout";

export const metadata: Metadata = {
  title: "Upgrade to Premium | WedPlan",
  description:
    "Unlock unlimited wedding service bookings with a simple one-time payment.",
};

export default function PremiumPage() {
  return (
    <AuthShell>
      <PremiumCheckout />
    </AuthShell>
  );
}

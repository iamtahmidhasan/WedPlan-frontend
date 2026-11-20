import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function PaymentButton() {
  return (
    <form action="/api/checkout_sessions" method="POST">
      <Button
        type="submit"
        role="link"
        size="lg"
        className="h-12 w-full text-base font-semibold shadow-xs"
      >
        <Sparkles className="size-4" />
        <span>Pay $20 (One-Time Payment)</span>
      </Button>
    </form>
  );
}

import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/core/getSession";
import { Sparkles } from "lucide-react";

export default async function PaymentButton({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const session = await getSession();
  //   const { canceled } = await searchParams;

  //   if (canceled) {
  //     console.log(
  //       "Order canceled -- continue to shop around and check out when you're ready.",
  //     );
  //   }

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

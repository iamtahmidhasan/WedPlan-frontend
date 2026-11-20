import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { apiFetch } from "@/lib/core/server";

export default async function getBookingCount() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  if (!userId) {
    return 0;
  }

  const res = await apiFetch(`/bookings`, { cache: "no-store" });
  if (!res.ok) {
    return 0;
  }

  const bookings = await res.json();
  const myBookings = bookings.filter(
    (b: { customerId?: string; vendorId?: string; userId?: string }) => {
      if (b.customerId === userId) return true;
      if (b.vendorId === userId) return true;
      if (b.userId === userId) return true;
      return false;
    }
  );

  return myBookings.length;
}

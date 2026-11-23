import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UsersTableClient } from "@/components/dashboard/users-table-client";

export const metadata = {
  title: "Manage Users | WedPlan Admin",
  description: "Manage registered users, roles, and platform access.",
};

export default async function UsersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const sessionUser = session?.user;
  const role = (sessionUser as { role?: string } | undefined)?.role;

  // Spec rule: Users must not be able to access another role's dashboard by manually changing the URL.
  // Only Admin can access the Admin Dashboard / Manage Users.
  if (!sessionUser || role !== "admin") {
    redirect("/dashboard");
  }

  return <UsersTableClient />;
}

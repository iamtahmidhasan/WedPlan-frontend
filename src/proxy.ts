import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const roleRoutes: Record<string, string[]> = {
  "/dashboard/users": ["admin"],
  "/dashboard/services": ["admin", "vendor"],
  "/dashboard/transactions": ["admin"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const allowedRoles = Object.entries(roleRoutes).find(([route]) =>
    pathname.startsWith(route),
  )?.[1];

  if (allowedRoles && !allowedRoles.includes(String(session.user.role ?? ""))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/services/:id"],
};

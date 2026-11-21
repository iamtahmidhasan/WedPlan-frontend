import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const roleRoutes: Record<string, string[]> = {
  "/dashboard/users": ["admin"],
  "/dashboard/services": ["admin", "vendor"],
  "/dashboard/transactions": ["admin"],
  "/dashboard/bookmarks": ["customer"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const signInUrl = new URL("/sign-in", request.url);
    if (pathname && pathname !== "/") {
      signInUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(signInUrl);
  }

  if (session.user.isBlocked) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  const allowedRoles = Object.entries(roleRoutes).find(([route]) =>
    pathname.startsWith(route),
  )?.[1];

  if (allowedRoles && !allowedRoles.includes(String(session.user.role ?? ""))) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/services/:id"],
};

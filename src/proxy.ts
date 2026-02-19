import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  // --- /mon-espace — artisans et particuliers ---
  if (pathname.startsWith("/mon-espace")) {
    if (!["artisan", "particulier"].includes(role ?? "")) {
      const url = new URL("/connexion", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // --- /messages — artisans et particuliers ---
  if (pathname.startsWith("/messages")) {
    if (!["artisan", "particulier"].includes(role ?? "")) {
      const url = new URL("/connexion", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // --- /admin — admin uniquement ---
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && !isAuthenticated) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && isAuthenticated && role === "admin") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/mon-espace/:path*", "/messages/:path*", "/admin/:path*"],
};

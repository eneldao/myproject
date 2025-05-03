import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Root path handling - explicitly allow access
  if (request.nextUrl.pathname === "/") {
    return res;
  }

  // Public routes - always accessible
  const publicRoutes = ["/about", "/contact", "/services"];
  if (
    publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  ) {
    return res;
  }

  // Auth routes handling
  if (request.nextUrl.pathname.startsWith("/auth")) {
    if (session) {
      // If user is signed in and tries to access auth pages, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return res;
  }

  // Check if user is authenticated for protected routes
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/transactions")
  ) {
    if (!session) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    return res;
  }

  // Admin routes handling
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", session.user.id)
      .single();

    if (!profile || profile.user_type !== "admin") {
      // Redirect non-admin users to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return res;
  }

  // Check if this is a page that should be protected
  const isAdminPage = request.nextUrl.pathname.startsWith("/auth/adminPage");
  const isAuthPage =
    request.nextUrl.pathname === "/signin" ||
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/signup";

  // Check if user is logged in as admin via cookies
  const adminLoggedIn = request.cookies.get("adminLoggedIn")?.value === "true";

  // If trying to access admin page without admin login
  if (isAdminPage && !adminLoggedIn) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // If admin user tries to access auth pages, redirect to admin dashboard
  if (isAuthPage && adminLoggedIn) {
    return NextResponse.redirect(new URL("/auth/adminPage", request.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (static image files)
     * - api (API routes that handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|api).*)",
    "/admin/:path*",
    "/signin",
    "/login",
    "/signup",
    "/auth/adminPage/:path*",
  ],
};

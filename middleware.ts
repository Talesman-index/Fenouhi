import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/types/supabase";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Clean up any legacy demo cookies if present
  if (request.cookies.has("admin_demo_access") || request.cookies.has("client_demo_access")) {
    response.cookies.delete("admin_demo_access");
    response.cookies.delete("client_demo_access");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/sign-up");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isCheckoutRoute = pathname.startsWith("/checkout");

  // Bypass DB and Auth checks for public routes
  if (!isAuthRoute && !isDashboardRoute && !isAdminRoute && !isCheckoutRoute) {
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Fetch user via Supabase Auth SSR
    let user = null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        user = data.user;
      }
    } catch {
      user = null;
    }

    // 1. UNAUTHENTICATED USERS: Block protected routes (Dashboard, Admin & Checkout)
    if (!user) {
      if (isDashboardRoute || isAdminRoute || isCheckoutRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        url.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(url);
      }
      return response;
    }

    // 2. AUTHENTICATED USERS: Fetch profile, role, and account status ONLY for protected/auth routes
    let userRole: UserRole = "customer";
    let accountStatus: string = "active";

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (profile) {
        if (profile.role) userRole = profile.role as UserRole;
        if (profile.status) accountStatus = profile.status;
      }
    } catch {
      // Default to active customer on error
    }

    // Explicit Super Admin privileges
    if (user.email === "ahoyoauronce@gmail.com" || user.email === "admin@cargolink.africa" || user.email === "superadmin@cargolink.africa") {
      userRole = "super_admin";
      accountStatus = "active";
    }

    // 3. SUSPENDED OR INACTIVE ACCOUNT CHECK
    if (accountStatus !== "active" && (isDashboardRoute || isAdminRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      url.searchParams.set("reason", "suspended");
      return NextResponse.redirect(url);
    }

    // 4. AUTH ROUTES (/auth/login, /auth/sign-up): Redirect authenticated users to appropriate workspace
    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      const isInternal = ["agent", "logistics", "admin", "super_admin"].includes(userRole);
      url.pathname = isInternal ? "/admin" : "/dashboard";
      return NextResponse.redirect(url);
    }

    // 5. ADMIN ROUTES (/admin/*): Enforce strict role-based access control
    if (isAdminRoute) {
      const isInternal = ["agent", "logistics", "admin", "super_admin"].includes(userRole);

      // Customer role cannot access /admin
      if (!isInternal) {
        const url = request.nextUrl.clone();
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }

      // Granular sub-route permissions for internal staff
      if (userRole === "logistics") {
        const allowedLogisticsRoutes = ["/admin", "/admin/shipments", "/admin/orders", "/admin/notifications", "/admin/products"];
        const isAllowed = allowedLogisticsRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));
        if (!isAllowed) {
          const url = request.nextUrl.clone();
          url.pathname = "/unauthorized";
          return NextResponse.redirect(url);
        }
      }

      if (userRole === "agent") {
        const restrictedAgentRoutes = ["/admin/users", "/admin/settings"];
        const isRestricted = restrictedAgentRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));
        if (isRestricted) {
          const url = request.nextUrl.clone();
          url.pathname = "/unauthorized";
          return NextResponse.redirect(url);
        }
      }
    }
  } catch (err) {
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

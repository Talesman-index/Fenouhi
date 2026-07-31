import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
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

    const pathname = request.nextUrl.pathname;
    const isAuthRoute = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/sign-up");
    const isDashboardRoute = pathname.startsWith("/dashboard");
    const isAdminRoute = pathname.startsWith("/admin");

    // Check for demo bypass via query param or cookie FIRST before any network calls
    const hasDemoParam = request.nextUrl.searchParams.get("demo") === "true" || request.nextUrl.searchParams.get("preview") === "admin" || request.nextUrl.searchParams.get("preview") === "client";
    const hasAdminDemoCookie = request.cookies.get("admin_demo_access")?.value === "true";
    const hasClientDemoCookie = request.cookies.get("client_demo_access")?.value === "true";

    if (isAdminRoute && (hasDemoParam || hasAdminDemoCookie)) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-demo-mode", "true");
      const demoResponse = NextResponse.next({ request: { headers: requestHeaders } });
      demoResponse.cookies.set("admin_demo_access", "true", { path: "/", maxAge: 60 * 60 * 24 * 7 });
      return demoResponse;
    }

    if (isDashboardRoute && (hasDemoParam || hasClientDemoCookie)) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-demo-mode", "true");
      const demoResponse = NextResponse.next({ request: { headers: requestHeaders } });
      demoResponse.cookies.set("client_demo_access", "true", { path: "/", maxAge: 60 * 60 * 24 * 7 });
      return demoResponse;
    }

    // Refresh session safely via Supabase Auth
    let user = null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        user = data.user;
      }
    } catch {
      user = null;
    }

    // 1. If user is NOT logged in and tries to access protected routes (/dashboard or /admin)
    if (!user && (isDashboardRoute || isAdminRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    // Fetch user profile if user exists and needs role-based routing
    let userRole = "customer";
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role) {
        userRole = profile.role;
      }
    }

    // 2. If user IS logged in and tries to access /admin
    if (user && isAdminRoute) {
      const isAdmin = ["admin", "super_admin", "agent", "logistics"].includes(userRole);
      if (!isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }
    }

    // 3. If user IS logged in and tries to access auth routes (/auth/login or /auth/sign-up)
    if (user && isAuthRoute) {
      const url = request.nextUrl.clone();
      const isAdmin = ["admin", "super_admin", "agent", "logistics"].includes(userRole);
      url.pathname = isAdmin ? "/admin" : "/dashboard";
      return NextResponse.redirect(url);
    }
  } catch (err) {
    // Edge recovery: return response
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

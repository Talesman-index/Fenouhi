import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

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

    // Refresh session safely
    const { data: { user } } = await supabase.auth.getUser();
    const pathname = request.nextUrl.pathname;

    const isAuthRoute = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/sign-up");
    const isDashboardRoute = pathname.startsWith("/dashboard");
    const isAdminRoute = pathname.startsWith("/admin");

    // Check for demo bypass via query param or cookie
    const hasDemoParam = request.nextUrl.searchParams.get("demo") === "true" || request.nextUrl.searchParams.get("preview") === "admin";
    const hasDemoCookie = request.cookies.get("admin_demo_access")?.value === "true";
    const isDemoMode = hasDemoParam || hasDemoCookie;

    if (isAdminRoute && isDemoMode) {
      if (hasDemoParam && !hasDemoCookie) {
        response.cookies.set("admin_demo_access", "true", { path: "/", maxAge: 60 * 60 * 24 * 7 });
      }
      return response;
    }

    // 1. If user is NOT logged in and tries to access protected routes (/dashboard or /admin)
    if (!user && (isDashboardRoute || isAdminRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    // 2. If user IS logged in and tries to access /admin
    if (user && isAdminRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const userRole = profile?.role;
      const isAdmin = userRole === "admin" || userRole === "super_admin";

      if (!isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }
    }

    // 3. If user IS logged in and tries to access auth routes (/auth/login or /auth/sign-up)
    if (user && isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  } catch (err) {
    // Edge recovery: return response
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

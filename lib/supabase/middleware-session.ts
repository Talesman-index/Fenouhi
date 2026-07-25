import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/types/supabase";

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Fallback if environment variables are not yet added in Vercel settings
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    const isAuthRoute = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/sign-up");
    const isDashboardRoute = pathname.startsWith("/dashboard");
    const isAdminRoute = pathname.startsWith("/admin");

    // 1. If user is NOT logged in and tries to access protected routes (/dashboard or /admin)
    if (!user && (isDashboardRoute || isAdminRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    // 2. If user IS logged in, verify profile role from Supabase
    if (user) {
      // If accessing auth routes (login/sign-up), redirect to appropriate home
      if (isAuthRoute) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const userRole: UserRole = profile?.role || "customer";
        const url = request.nextUrl.clone();
        url.pathname = ["admin", "super_admin", "agent", "logistics"].includes(userRole) 
          ? "/admin" 
          : "/dashboard";
        return NextResponse.redirect(url);
      }

      // If customer tries to access /admin -> redirect to /dashboard
      if (isAdminRoute) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const userRole: UserRole = profile?.role || "customer";
        const allowedRoles: UserRole[] = ["agent", "logistics", "admin", "super_admin"];

        if (!allowedRoles.includes(userRole)) {
          const url = request.nextUrl.clone();
          url.pathname = "/dashboard";
          return NextResponse.redirect(url);
        }
      }
    }
  } catch (err) {
    console.error("Middleware Supabase update error:", err);
  }

  return supabaseResponse;
};

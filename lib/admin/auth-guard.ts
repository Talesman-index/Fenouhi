import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import type { Profile } from "@/types/supabase";

export async function requireAdmin(): Promise<{ user: any; profile: Profile }> {
  // Check x-demo-mode header (set by middleware on every request, available even before cookie is visible)
  const headersList = await headers();
  const hasDemoHeader = headersList.get("x-demo-mode") === "true";

  // Also check the persistent cookie for subsequent navigations
  const cookieStore = await cookies();
  const hasDemoCookie = cookieStore.get("admin_demo_access")?.value === "true";

  const isDemoMode = hasDemoHeader || hasDemoCookie;

  if (isDemoMode) {
    const demoProfile: Profile = {
      id: "demo-admin-id",
      first_name: "Administrateur",
      last_name: "CargoLink",
      email: "admin@cargolink.africa",
      phone: "+229 97 00 00 00",
      country: "Bénin",
      city: "Cotonou",
      account_type: "business",
      role: "admin",
      status: "active",
      avatar_url: null,
      last_activity: new Date().toISOString(),
      notes: "Compte Administrateur Demo",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return {
      user: { id: "demo-admin-id", email: "admin@cargolink.africa" },
      profile: demoProfile,
    };
  }

  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/auth/login?redirectTo=/admin");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/unauthorized");
  }

  const isAdmin = profile.role === "admin" || profile.role === "super_admin";
  if (!isAdmin) {
    redirect("/unauthorized");
  }

  return { user, profile: profile as Profile };
}

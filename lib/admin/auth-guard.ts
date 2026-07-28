import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile } from "@/types/supabase";

export async function requireAdmin(): Promise<{ user: any; profile: Profile }> {
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

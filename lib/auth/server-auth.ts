import { createClient } from "@/lib/supabase/server";
import type { UserRole, Profile } from "@/types/supabase";

export interface AuthenticatedContext {
  user: {
    id: string;
    email?: string;
  };
  profile: Profile;
}

/**
 * Server-side function to get the current authenticated user and their active profile.
 * Re-checks session, user identity, profile role, and account status.
 * Returns null if unauthenticated, profile missing, or account status is not 'active'.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedContext | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    // Account status check (must be active)
    if (profile.status && profile.status !== "active") {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile as Profile,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Server-side verification function for Server Actions and Route Handlers.
 * Throws an explicit error if the user is unauthenticated, inactive, or lacks the required role.
 */
export async function requireUserRole(allowedRoles: UserRole[]): Promise<AuthenticatedContext> {
  const authContext = await getAuthenticatedUser();
  
  if (!authContext) {
    throw new Error("UNAUTHORIZED: Session invalide ou compte inactif.");
  }

  if (!allowedRoles.includes(authContext.profile.role)) {
    throw new Error("FORBIDDEN: Droits insuffisants pour cette opération.");
  }

  return authContext;
}

/**
 * Helper to check if a role is an internal team role.
 */
export function isInternalRole(role: UserRole): boolean {
  return ["agent", "logistics", "admin", "super_admin"].includes(role);
}

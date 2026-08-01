export const DEMO_CLIENT_EMAIL = "client.demo@cargolink.africa";
export const DEMO_ADMIN_EMAIL = "admin.demo@cargolink.africa";

export function isDemoUser(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return normalized === DEMO_CLIENT_EMAIL || normalized === DEMO_ADMIN_EMAIL;
}

export function isDemoAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === DEMO_ADMIN_EMAIL;
}

export type DemoGuardActionType =
  | "UPDATE_USER_ROLE"
  | "SUSPEND_USER"
  | "DELETE_REAL_PRODUCT"
  | "MODIFY_REAL_PRODUCT"
  | "ARCHIVE_REAL_PRODUCT"
  | "DELETE_REAL_ORDER"
  | "MODIFY_SENSITIVE_SETTINGS"
  | "DELETE_REAL_DATA";

/**
 * Server-side safety guard preventing demo admin accounts from modifying real users,
 * real products, real orders, sensitive settings, or deleting non-demo items.
 */
export function validateDemoAdminAction(params: {
  userEmail?: string | null;
  targetIsDemo?: boolean;
  actionType: DemoGuardActionType;
}): { allowed: boolean; reason?: string } {
  const { userEmail, targetIsDemo, actionType } = params;

  if (!isDemoAdmin(userEmail)) {
    // Normal admin, no demo restrictions
    return { allowed: true };
  }

  // 1. Modifier le rôle d'un vrai utilisateur
  if (actionType === "UPDATE_USER_ROLE") {
    return {
      allowed: false,
      reason: "DEMO_RESTRICTION: Le compte administrateur de démonstration ne peut pas modifier les rôles d'utilisateurs réels.",
    };
  }

  // 2. Suspendre un vrai utilisateur
  if (actionType === "SUSPEND_USER") {
    return {
      allowed: false,
      reason: "DEMO_RESTRICTION: Le compte administrateur de démonstration ne peut pas suspendre ou désactiver un utilisateur réel.",
    };
  }

  // 3. Supprimer ou modifier un vrai produit (targetIsDemo = false)
  if (
    (actionType === "DELETE_REAL_PRODUCT" ||
      actionType === "MODIFY_REAL_PRODUCT" ||
      actionType === "ARCHIVE_REAL_PRODUCT") &&
    targetIsDemo === false
  ) {
    return {
      allowed: false,
      reason: "DEMO_RESTRICTION: Le compte de démonstration ne peut pas modifier, archiver ou supprimer un produit réel (is_demo=FALSE).",
    };
  }

  // 4. Supprimer une vraie commande (targetIsDemo = false)
  if (actionType === "DELETE_REAL_ORDER" && targetIsDemo === false) {
    return {
      allowed: false,
      reason: "DEMO_RESTRICTION: Le compte de démonstration ne peut pas supprimer une commande réelle (is_demo=FALSE).",
    };
  }

  // 5. Modifier des paramètres sensibles
  if (actionType === "MODIFY_SENSITIVE_SETTINGS") {
    return {
      allowed: false,
      reason: "DEMO_RESTRICTION: La modification des paramètres de sécurité et clés API est désactivée en mode démonstration.",
    };
  }

  // 6. Règle générale de suppression de données réelles
  if (actionType === "DELETE_REAL_DATA" && targetIsDemo === false) {
    return {
      allowed: false,
      reason: "DEMO_RESTRICTION: Suppression de données réelles interdite pour le compte démo.",
    };
  }

  return { allowed: true };
}

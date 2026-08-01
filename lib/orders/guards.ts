import { createClient } from "@/lib/supabase/server";

export interface GuardCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Server-side guard to verify that a product is a REAL commercial product (is_demo === false)
 * before inserting into a real order, payment, or commercial shipment.
 */
export async function validateProductForRealOrder(productId: string): Promise<GuardCheckResult> {
  try {
    const supabase = await createClient();
    const { data: product, error } = await supabase
      .from("products")
      .select("id, name, is_demo, status")
      .eq("id", productId)
      .single();

    if (error || !product) {
      return { allowed: false, reason: "Produit non trouvé." };
    }

    if (product.is_demo) {
      return {
        allowed: false,
        reason: `FORBIDDEN_DEMO_PRODUCT: L'article "${product.name}" est un produit de démonstration (is_demo=TRUE) et ne peut pas être ajouté à une commande commerciale réelle.`,
      };
    }

    if (product.status !== "active") {
      return {
        allowed: false,
        reason: `INACTIVE_PRODUCT: L'article "${product.name}" n'est pas actif pour la vente.`,
      };
    }

    return { allowed: true };
  } catch (err: any) {
    return { allowed: false, reason: err.message || "Erreur de validation du produit." };
  }
}

-- ============================================================================
-- CargoLink Africa — Migration 005 (IDEMPOTENTE)
-- Protections BDD & Gardes Produits Démo dans les Vraies Opérations
-- ============================================================================

-- 1. TRIGGER POUR EMPÊCHER L'AJOUT DE PRODUITS DE DÉMONSTRATION DANS LES COMMANDES RÉELLES
CREATE OR REPLACE FUNCTION public.prevent_demo_product_in_orders()
RETURNS TRIGGER AS $$
DECLARE
  target_is_demo BOOLEAN := FALSE;
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    SELECT is_demo INTO target_is_demo
    FROM public.products
    WHERE id = NEW.product_id;

    IF target_is_demo IS TRUE THEN
      RAISE EXCEPTION 'FORBIDDEN_DEMO_PRODUCT: Impossible d''ajouter un produit de démonstration (is_demo=TRUE) à une commande commerciale réelle.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attachement du trigger sur order_items si la table existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
    DROP TRIGGER IF EXISTS check_demo_product_order ON public.order_items;
    CREATE TRIGGER check_demo_product_order
      BEFORE INSERT OR UPDATE ON public.order_items
      FOR EACH ROW EXECUTE FUNCTION public.prevent_demo_product_in_orders();
  END IF;
END $$;

-- 2. VUE DES PRODUITS COMMERCIAUX RÉELS (EXCLUT LES DÉMOS)
CREATE OR REPLACE VIEW public.real_commercial_products AS
SELECT *
FROM public.products
WHERE is_demo = FALSE AND status = 'active';

-- ============================================================================
-- ✅ FIN MIGRATION 005
-- ============================================================================

-- ============================================================================
-- CargoLink Africa — Migration 006 (IDEMPOTENTE)
-- Support d'Isolation de l'Environnement de Démonstration (is_demo) & Profils Démo
-- ============================================================================

-- 1. AJOUT DU CHAMP is_demo SUR TOUTES LES TABLES DE TRANSACTION / SUIVI
DO $$
BEGIN
  -- quotes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotes') THEN
    ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  -- orders
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  -- order_items
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
    ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  -- payments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  -- shipments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shipments') THEN
    ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  -- shipment_events
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shipment_events') THEN
    ALTER TABLE public.shipment_events ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  -- disputes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'disputes') THEN
    ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  -- dispute_messages
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dispute_messages') THEN
    ALTER TABLE public.dispute_messages ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  -- notifications
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  -- activity_logs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_logs') THEN
    ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- 2. CRÉATION DES INDEX POUR DÉMO
CREATE INDEX IF NOT EXISTS idx_quotes_is_demo ON public.quotes(is_demo);
CREATE INDEX IF NOT EXISTS idx_orders_is_demo ON public.orders(is_demo);
CREATE INDEX IF NOT EXISTS idx_payments_is_demo ON public.payments(is_demo);
CREATE INDEX IF NOT EXISTS idx_shipments_is_demo ON public.shipments(is_demo);
CREATE INDEX IF NOT EXISTS idx_disputes_is_demo ON public.disputes(is_demo);
CREATE INDEX IF NOT EXISTS idx_notifications_is_demo ON public.notifications(is_demo);

-- 3. PROMOTION DES COMPTES DÉMO DANS PUBLIC.PROFILES
UPDATE public.profiles
SET role = 'admin', status = 'active'
WHERE email = 'admin.demo@cargolink.africa';

UPDATE public.profiles
SET role = 'customer', status = 'active'
WHERE email = 'client.demo@cargolink.africa';

-- 4. PERMISSIONS DE TABLE POSTGRES (GRANT) POUR LES RÔLES AUTHENTICATED ET ANON
GRANT ALL ON TABLE public.quotes TO authenticated, anon;
GRANT ALL ON TABLE public.orders TO authenticated, anon;
GRANT ALL ON TABLE public.order_items TO authenticated, anon;
GRANT ALL ON TABLE public.payments TO authenticated, anon;
GRANT ALL ON TABLE public.shipments TO authenticated, anon;
GRANT ALL ON TABLE public.shipment_events TO authenticated, anon;
GRANT ALL ON TABLE public.disputes TO authenticated, anon;
GRANT ALL ON TABLE public.dispute_messages TO authenticated, anon;
GRANT ALL ON TABLE public.notifications TO authenticated, anon;
GRANT ALL ON TABLE public.activity_logs TO authenticated, anon;

-- ============================================================================
-- ✅ FIN MIGRATION 006
-- ============================================================================

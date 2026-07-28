-- ============================================================================
-- CargoLink Africa — Migration 002 (IDEMPOTENTE)
-- Schéma Complet Admin — Tables, Triggers, RLS & Seed Data
-- ============================================================================
-- PRÉREQUIS : La migration 001_auth_profiles_roles.sql doit être exécutée AVANT
-- cette migration. public.profiles doit exister.
-- ============================================================================

-- 1. ENUMS FOR ADMIN OPERATIONS
DO $$ BEGIN
  CREATE TYPE public.quote_status AS ENUM ('new', 'under_review', 'quote_sent', 'accepted', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'pending_payment', 'confirmed', 'product_purchased', 'received_in_china', 
    'ready_to_ship', 'shipped', 'customs_clearance', 'available_for_pickup', 
    'delivered', 'cancelled', 'refunded'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.shipping_mode AS ENUM ('air', 'sea');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.partner_type AS ENUM ('supplier', 'shipping_partner', 'agent', 'warehouse');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.dispute_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.dispute_status AS ENUM ('open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. COLONNES PROFILES (déjà ajoutées dans 001 — vérification de sécurité uniquement)
-- Ces colonnes sont gérées dans 001_auth_profiles_roles.sql
-- On reconfirme avec IF NOT EXISTS pour la sécurité en cas d'exécution indépendante
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status        TEXT        NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS notes         TEXT;

-- 3. QUOTES TABLE
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT,
  product_link TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  estimated_price NUMERIC(12, 2) DEFAULT 0,
  estimated_weight NUMERIC(8, 2) DEFAULT 0,
  shipping_mode public.shipping_mode NOT NULL DEFAULT 'air',
  destination_country TEXT NOT NULL DEFAULT 'Bénin',
  destination_city TEXT NOT NULL DEFAULT 'Cotonou',
  status public.quote_status NOT NULL DEFAULT 'new',
  
  -- Calculated amounts
  product_cost NUMERIC(12, 2) DEFAULT 0,
  service_fee NUMERIC(12, 2) DEFAULT 0,
  shipping_fee NUMERIC(12, 2) DEFAULT 0,
  extra_fee NUMERIC(12, 2) DEFAULT 0,
  total_amount NUMERIC(12, 2) GENERATED ALWAYS AS (product_cost + service_fee + shipping_fee + extra_fee) STORED,
  
  expiration_date TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_user ON public.quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);

-- 4. SUPPLIERS & PARTNERS TABLE
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  partner_type public.partner_type NOT NULL DEFAULT 'supplier',
  company_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  country TEXT NOT NULL DEFAULT 'Chine',
  services TEXT,
  reliability_rating NUMERIC(3, 1) DEFAULT 5.0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  order_status public.order_status NOT NULL DEFAULT 'pending_payment',
  shipping_mode public.shipping_mode NOT NULL DEFAULT 'air',
  destination_country TEXT NOT NULL DEFAULT 'Bénin',
  destination_city TEXT NOT NULL DEFAULT 'Cotonou',
  
  assigned_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  partner_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  
  supplier_ref TEXT,
  invoice_url TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_url TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) DEFAULT 0,
  total_price NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SHIPMENTS TABLE
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  tracking_number TEXT UNIQUE NOT NULL,
  carrier TEXT NOT NULL DEFAULT 'CargoLink Express',
  shipping_mode public.shipping_mode NOT NULL DEFAULT 'air',
  weight NUMERIC(8, 2) DEFAULT 0,
  volume NUMERIC(8, 2) DEFAULT 0,
  destination_country TEXT NOT NULL DEFAULT 'Bénin',
  destination_city TEXT NOT NULL DEFAULT 'Cotonou',
  departure_date TIMESTAMPTZ,
  estimated_arrival TIMESTAMPTZ,
  current_location TEXT DEFAULT 'Entrepôt Guangzhou',
  status TEXT NOT NULL DEFAULT 'in_transit',
  proof_of_delivery_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SHIPMENT EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT,
  event_time TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_ref TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  payment_method TEXT NOT NULL DEFAULT 'Mobile Money',
  status public.payment_status NOT NULL DEFAULT 'pending',
  proof_of_payment_url TEXT,
  admin_note TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DISPUTES TABLE
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority public.dispute_priority NOT NULL DEFAULT 'medium',
  status public.dispute_status NOT NULL DEFAULT 'open',
  assigned_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. DISPUTE MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.dispute_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES public.disputes(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_name TEXT,
  message TEXT NOT NULL,
  attachments TEXT[],
  is_internal_note BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  recipient_type TEXT NOT NULL DEFAULT 'all', -- 'all', 'user', 'group'
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  channel TEXT DEFAULT 'in_app', -- 'in_app', 'email', 'whatsapp'
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PLATFORM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. CONTENT PAGES TABLE
CREATE TABLE IF NOT EXISTS public.content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'faq', 'announcement', 'promotion', 'legal', 'city', 'country'
  key TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUTOMATIC UPDATED_AT TRIGGERS
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('quotes', 'orders', 'shipments', 'payments', 'suppliers', 'disputes', 'platform_settings', 'content_pages') LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON public.%I;', tbl);
    EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();', tbl);
  END LOOP;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all newly created tables
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUES RLS IDEMPOTENTES (DROP IF EXISTS → CREATE)
-- ============================================================================

-- ADMIN : Accès complet à toutes les tables
DROP POLICY IF EXISTS "Admins full access on quotes"           ON public.quotes;
DROP POLICY IF EXISTS "Admins full access on orders"           ON public.orders;
DROP POLICY IF EXISTS "Admins full access on order_items"      ON public.order_items;
DROP POLICY IF EXISTS "Admins full access on shipments"        ON public.shipments;
DROP POLICY IF EXISTS "Admins full access on shipment_events"  ON public.shipment_events;
DROP POLICY IF EXISTS "Admins full access on payments"         ON public.payments;
DROP POLICY IF EXISTS "Admins full access on suppliers"        ON public.suppliers;
DROP POLICY IF EXISTS "Admins full access on disputes"         ON public.disputes;
DROP POLICY IF EXISTS "Admins full access on dispute_messages" ON public.dispute_messages;
DROP POLICY IF EXISTS "Admins full access on notifications"    ON public.notifications;
DROP POLICY IF EXISTS "Admins full access on activity_logs"    ON public.activity_logs;
DROP POLICY IF EXISTS "Admins full access on platform_settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins full access on content_pages"    ON public.content_pages;

CREATE POLICY "Admins full access on quotes"           ON public.quotes           TO authenticated USING (public.has_role(ARRAY['admin', 'super_admin'])) WITH CHECK (public.has_role(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins full access on orders"           ON public.orders           TO authenticated USING (public.has_role(ARRAY['admin', 'super_admin'])) WITH CHECK (public.has_role(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins full access on order_items"      ON public.order_items      TO authenticated USING (public.has_role(ARRAY['admin', 'super_admin'])) WITH CHECK (public.has_role(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins full access on shipments"        ON public.shipments        TO authenticated USING (public.has_role(ARRAY['admin', 'super_admin'])) WITH CHECK (public.has_role(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins full access on shipment_events"  ON public.shipment_events  TO authenticated USING (public.has_role(ARRAY['admin', 'super_admin'])) WITH CHECK (public.has_role(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins full access on payments"         ON public.payments         TO authenticated USING (public.has_role(ARRAY['admin', 'super_admin'])) WITH CHECK (public.has_role(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins full access on suppliers"        ON public.suppliers        TO authenticated USING (public.has_role(ARRAY['admin', 'super_admin'])) WITH CHECK (public.has_role(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins full access on disputes"         ON public.disputes         TO authenticated USING (public.has_role(ARRAY['admin', 'super_admin'])) WITH CHECK (public.has_role(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins full access on dispute_messages" ON public.dispute_messages TO authenticated USING (public.has_role(ARRAY['admin', 'super_admin'])) WITH CHECK (public.has_role(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins full access on notifications"    ON public.notifications    TO authenticated USING (public.has_role(ARRAY['admin', 'super_admin'])) WITH CHECK (public.has_role(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins full access on activity_logs"    ON public.activity_logs    TO authenticated USING (public.has_role(ARRAY['admin', 'super_admin'])) WITH CHECK (public.has_role(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins full access on platform_settings" ON public.platform_settings TO authenticated USING (public.has_role(ARRAY['admin', 'super_admin'])) WITH CHECK (public.has_role(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins full access on content_pages"    ON public.content_pages    TO authenticated USING (public.has_role(ARRAY['admin', 'super_admin'])) WITH CHECK (public.has_role(ARRAY['admin', 'super_admin']));

-- CLIENTS : Accès à leurs propres données
DROP POLICY IF EXISTS "Users can view own quotes"               ON public.quotes;
DROP POLICY IF EXISTS "Users can create quotes"                 ON public.quotes;
DROP POLICY IF EXISTS "Users can view own orders"               ON public.orders;
DROP POLICY IF EXISTS "Users can view own payments"             ON public.payments;
DROP POLICY IF EXISTS "Users can view own disputes"             ON public.disputes;
DROP POLICY IF EXISTS "Users can insert own dispute messages"   ON public.dispute_messages;
DROP POLICY IF EXISTS "Users can view own notifications"        ON public.notifications;
DROP POLICY IF EXISTS "Public read platform content"            ON public.content_pages;
DROP POLICY IF EXISTS "Public read platform settings"           ON public.platform_settings;

CREATE POLICY "Users can view own quotes"               ON public.quotes              FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create quotes"                 ON public.quotes              FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own orders"               ON public.orders              FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own payments"             ON public.payments            FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own disputes"             ON public.disputes            FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own dispute messages"   ON public.dispute_messages    FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can view own notifications"        ON public.notifications       FOR SELECT TO authenticated USING (user_id = auth.uid() OR recipient_type = 'all');
CREATE POLICY "Public read platform content"            ON public.content_pages       FOR SELECT TO authenticated, anon USING (is_active = true);
CREATE POLICY "Public read platform settings"           ON public.platform_settings   FOR SELECT TO authenticated, anon USING (true);

-- INITIAL SEED DATA FOR PLATFORM SETTINGS
INSERT INTO public.platform_settings (key, value, description)
VALUES 
  ('service_fees', '{"rate_percent": 5, "fixed_fee_fcfa": 2500}'::jsonb, 'Frais de service d’achat et gestion CargoLink Africa'),
  ('shipping_rates', '{"air_per_kg_fcfa": 7500, "sea_per_cbm_fcfa": 185000}'::jsonb, 'Tarifs d’expédition Chine vers Afrique'),
  ('contact_info', '{"email": "contact@cargolink.africa", "phone": "+229 97 00 00 00", "address": "Boulevard de la Marina, Cotonou, Bénin"}'::jsonb, 'Informations de contact officielles')
ON CONFLICT (key) DO NOTHING;

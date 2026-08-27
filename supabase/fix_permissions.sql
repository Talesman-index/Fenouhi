-- ============================================================================
-- FIX PERMISSIONS & RLS POLICIES - CARGOLINK AFRICA / FENOUSHOP
-- À exécuter dans l'éditeur SQL de Supabase :
-- https://supabase.com/dashboard/project/ujxkxfsmbargtttoooam/sql/new
-- ============================================================================

-- 1. CRÉATION DES TABLES AU CAS OÙ ELLES N'EXISTENT PAS
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  cargolink_margin_percent NUMERIC(5,2) DEFAULT 10,
  air_freight_rate_per_kg NUMERIC(10,2) DEFAULT 2000,
  sea_freight_rate_per_cbm NUMERIC(10,2) DEFAULT 2000,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  stock_quantity INTEGER NOT NULL DEFAULT 100 CHECK (stock_quantity >= 0),
  minimum_order_quantity INTEGER NOT NULL DEFAULT 1 CHECK (minimum_order_quantity > 0),
  country_of_origin TEXT DEFAULT 'Hub International',
  weight NUMERIC(10,2),
  length NUMERIC(10,2),
  width NUMERIC(10,2),
  height NUMERIC(10,2),
  available_shipping_modes TEXT[] DEFAULT ARRAY['air', 'sea']::TEXT[],
  estimated_delivery_time TEXT DEFAULT '5 - 15 jours (Aérien) / 50 - 95 jours (Maritime)',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'out_of_stock', 'inactive', 'archived')),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  original_image_path TEXT,
  watermarked_image_path TEXT,
  public_image_url TEXT NOT NULL,
  alt_text TEXT,
  position INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ATTRIBUTION EXPLICITE DES PRIVILÈGES TABLES & SÉQUENCES AUX RÔLES
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 3. ACTIVATION ET CONFIGURATION DES POLITIQUES RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Politiques de Lecture (Public)
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read product_images" ON public.product_images;
CREATE POLICY "Public read product_images" ON public.product_images FOR SELECT USING (true);

-- Politiques d'Écriture (ALL / INSERT / UPDATE / DELETE)
DROP POLICY IF EXISTS "Admin write categories" ON public.categories;
CREATE POLICY "Admin write categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write products" ON public.products;
CREATE POLICY "Admin write products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write product_images" ON public.product_images;
CREATE POLICY "Admin write product_images" ON public.product_images FOR ALL USING (true) WITH CHECK (true);

-- 4. INSERTION DES CATÉGORIES PRINCIPALES (IDEMPOTENT)
INSERT INTO public.categories (id, name, slug, description, icon, is_active) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'High-Tech & Électronique', 'electronics', 'Smartphones, montres connectées, écouteurs et audio.', 'Smartphone', TRUE),
  ('c1000000-0000-0000-0000-000000000002', 'Mode & Chaussures', 'fashion', 'Sneakers, vêtements streetwear, sacs et maroquinerie.', 'Shirt', TRUE),
  ('c1000000-0000-0000-0000-000000000003', 'Beauté & Soins', 'beauty', 'Sérums visage, soin de la peau, cosmétiques.', 'Sparkles', TRUE),
  ('c1000000-0000-0000-0000-000000000004', 'Machinerie & Outillage', 'machinery', 'Équipements de travail, outillage et machines.', 'Wrench', TRUE),
  ('c1000000-0000-0000-0000-000000000005', 'Agro-alimentaire & Vrac', 'agro', 'Emballages et conditionnements alimentaires.', 'ShoppingBag', TRUE),
  ('c1000000-0000-0000-0000-000000000006', 'Sport & Fitness', 'sport', 'Équipements de sport, fitness et plein air.', 'Activity', TRUE),
  ('c1000000-0000-0000-0000-000000000007', 'Vrac & Grossistes', 'wholesale', 'Lots d''articles en gros import direct usines Chine.', 'Package', TRUE),
  ('c1000000-0000-0000-0000-000000000008', 'Maison & Décoration', 'home', 'Mobilier, luminaires, électroménager et décoration.', 'Home', TRUE),
  ('c1000000-0000-0000-0000-000000000009', 'Solaire & Énergie', 'solar', 'Kits solaires, onduleurs, panneaux et batteries.', 'Sun', TRUE)
ON CONFLICT (id) DO NOTHING;

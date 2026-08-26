-- ============================================================================
-- CargoLink Africa — Migration 004 (IDEMPOTENTE)
-- Vrai Catalogue Produits Supabase & Isolation Produits Démo vs Réels
-- ============================================================================

-- 1. TABLE DES CATÉGORIES
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

-- 2. TABLE DES PRODUITS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'FCFA',
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  minimum_order_quantity INTEGER NOT NULL DEFAULT 1 CHECK (minimum_order_quantity > 0),
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  country_of_origin TEXT DEFAULT 'Chine',
  weight NUMERIC(10,2),
  length NUMERIC(10,2),
  width NUMERIC(10,2),
  height NUMERIC(10,2),
  available_shipping_modes TEXT[] DEFAULT ARRAY['air']::TEXT[] CHECK (available_shipping_modes <@ ARRAY['air', 'sea']::TEXT[]),
  estimated_delivery_time TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'out_of_stock', 'inactive', 'archived')),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE DES IMAGES PRODUITS
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  original_image_path TEXT,
  watermarked_image_path TEXT,
  public_image_url TEXT,
  alt_text TEXT,
  position INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  width INTEGER,
  height INTEGER,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEX
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_demo ON public.products(is_demo);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- TRIGGERS UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS (ROW LEVEL SECURITY)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- POLITIQUES CATEGORIES
DROP POLICY IF EXISTS "Public read active categories" ON public.categories;
CREATE POLICY "Public read active categories" ON public.categories
  FOR SELECT USING (is_active = TRUE OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'agent', 'logistics')
  ));

DROP POLICY IF EXISTS "Admin full control on categories" ON public.categories;
CREATE POLICY "Admin full control on categories" ON public.categories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- POLITIQUES PRODUCTS
DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products" ON public.products
  FOR SELECT USING (status = 'active' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'agent', 'logistics')
  ));

DROP POLICY IF EXISTS "Admin full control on products" ON public.products;
CREATE POLICY "Admin full control on products" ON public.products
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- POLITIQUES PRODUCT_IMAGES
DROP POLICY IF EXISTS "Public read product images" ON public.product_images;
CREATE POLICY "Public read product images" ON public.product_images
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.products p WHERE p.id = product_images.product_id AND (p.status = 'active' OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'agent', 'logistics')
    ))
  ));

DROP POLICY IF EXISTS "Admin full control on product_images" ON public.product_images;
CREATE POLICY "Admin full control on product_images" ON public.product_images
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- ============================================================================
-- SEED INITIAL IDEMPOTENT (CATÉGORIES + 10 PRODUITS DE DÉMONSTRATION)
-- ============================================================================

INSERT INTO public.categories (id, name, slug, description, icon, is_active) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'High-Tech & Audio', 'electronics', 'Montres connectées, écouteurs, casques audio et accessoires électroniques.', 'Smartphone', TRUE),
  ('c1000000-0000-0000-0000-000000000002', 'Mode & Chaussures', 'fashion', 'Sneakers, vestes, t-shirts, bijoux et vêtements de travail usine.', 'Shirt', TRUE),
  ('c1000000-0000-0000-0000-000000000003', 'Beauté & Soins', 'beauty', 'Sérums visage, soins cosmétiques et matériel esthétique.', 'Sparkles', TRUE),
  ('c1000000-0000-0000-0000-000000000004', 'Outillage & PME', 'machinery', 'Gants de protection, équipements de travail et machines industrielles.', 'Wrench', TRUE),
  ('c1000000-0000-0000-0000-000000000005', 'Agro-alimentaire & Vrac', 'agro', 'Emballages alimentaires, conditionnements et produits bruts.', 'ShoppingBag', TRUE),
  ('c1000000-0000-0000-0000-000000000006', 'Sport & Fitness', 'sport', 'Équipements fitness, vêtements sportifs et plein air.', 'Activity', TRUE),
  ('c1000000-0000-0000-0000-000000000007', 'Vrac & Grossistes', 'wholesale', 'Lots d''articles en gros import direct usines Chine.', 'Package', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- SEED 10 PRODUITS DÉMO
INSERT INTO public.products (id, name, slug, short_description, description, category_id, subcategory, price, currency, stock_quantity, minimum_order_quantity, country_of_origin, weight, length, width, height, available_shipping_modes, estimated_delivery_time, status, is_demo, is_featured) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'Montre Connectée SmartFit Pro X', 'montre-connectee-smartfit-pro-x', 'Montre connectée étanche avec suivi cardiaque & SpO2', 'Écran HD 1.85", Suivi cardiaque & SpO2, Étanchéité IP68, Autonomie 7 jours. Compatible iOS & Android.', 'c1000000-0000-0000-0000-000000000001', 'Montres', 3500, 'FCFA', 500, 10, 'Chine', 0.25, 10, 8, 5, ARRAY['air', 'sea'], '7 - 10 jours (Air)', 'active', TRUE, TRUE),
  ('p1000000-0000-0000-0000-000000000002', 'Écouteurs Bluetooth ANC SoundBass', 'ecouteurs-bluetooth-anc-soundbass', 'Réduction de bruit active ANC, autonomie 24h avec boîtier', 'Réduction de bruit active ANC -30dB, Bluetooth 5.3, étanchéité IPX5, autonomie 24h avec boîtier de charge rapide USB-C.', 'c1000000-0000-0000-0000-000000000001', 'Écouteurs', 2200, 'FCFA', 800, 20, 'Chine', 0.15, 6, 5, 3, ARRAY['air', 'sea'], '7 - 10 jours (Air)', 'active', TRUE, TRUE),
  ('p1000000-0000-0000-0000-000000000003', 'Casque Audio Over-Ear Wireless', 'casque-audio-over-ear-wireless', 'Son HD Surround, coussinets à mémoire de forme, autonomie 40h', 'Casque circum-aural haute fidélité, haut-parleurs 40mm, microphone HD intégré, pliable avec housse de transport.', 'c1000000-0000-0000-0000-000000000001', 'Casques', 4500, 'FCFA', 300, 10, 'Chine', 0.45, 18, 15, 8, ARRAY['air', 'sea'], '7 - 10 jours (Air)', 'active', TRUE, FALSE),
  ('p1000000-0000-0000-0000-000000000004', 'Baskets Urban Sport Sneaker Pro', 'baskets-urban-sport-sneaker-pro', 'Semelle alvéolée amortissante, respirante et ultra légère', 'Baskets de sport respirantes grand confort, semelle anti-dérapante en EVA, adaptées pour le running et le style urbain.', 'c1000000-0000-0000-0000-000000000002', 'Chaussures', 2800, 'FCFA', 600, 15, 'Chine', 0.85, 30, 20, 12, ARRAY['sea'], '30 - 45 jours (Mer)', 'active', TRUE, TRUE),
  ('p1000000-0000-0000-0000-000000000005', 'Sérum Visage Vitamine C Éclat', 'serum-visage-vitamine-c-eclat', 'Flacon 30ml avec compte-gouttes, anti-taches & illuminateur', 'Sérum concentré à 20% de Vitamine C pure et Acide Hyaluronique, formule anti-oxydante pour un teint uni et lumineux.', 'c1000000-0000-0000-0000-000000000003', 'Cosmétiques', 950, 'FCFA', 1200, 50, 'Chine', 0.12, 5, 5, 10, ARRAY['air'], '7 - 10 jours (Air)', 'active', TRUE, FALSE),
  ('p1000000-0000-0000-0000-000000000006', 'T-Shirt Graphic Streetwear Red Edition', 't-shirt-graphic-streetwear-red-edition', '100% Coton peigné 220g/m², coupe oversized imprimé sérigraphié', 'T-shirt streetwear en coton lourd 220 GSM, impression sérigraphique durable au lavage, coutures renforcées.', 'c1000000-0000-0000-0000-000000000002', 'Vêtements', 1200, 'FCFA', 1000, 30, 'Chine', 0.28, 25, 20, 2, ARRAY['air', 'sea'], '7 - 10 jours (Air)', 'active', TRUE, FALSE),
  ('p1000000-0000-0000-0000-000000000007', 'Coffret Bijoux Doré 24k Luxury', 'coffret-bijoux-dore-24k-luxury', 'Parure collier + boucles d''oreilles + bracelet acier inoxydable', 'Parure complète plaquée or 24K anti-allergique, acier inoxydable haute durabilité, livrée dans une boîte cadeau velours.', 'c1000000-0000-0000-0000-000000000002', 'Bijoux', 1800, 'FCFA', 450, 20, 'Chine', 0.30, 15, 12, 6, ARRAY['air'], '7 - 10 jours (Air)', 'active', TRUE, FALSE),
  ('p1000000-0000-0000-0000-000000000008', 'Veste Blouson Imperméable Workwear', 'veste-blouson-impermeable-workwear', 'Coupe cargo utilitaire, tissu déperlant, multiples poches', 'Veste imperméable respirante pour professionnels et chantiers, fermeture double zip renforcée, doublure respirante mesh.', 'c1000000-0000-0000-0000-000000000002', 'Vêtements', 3200, 'FCFA', 400, 10, 'Chine', 0.95, 35, 28, 5, ARRAY['sea'], '30 - 45 jours (Mer)', 'active', TRUE, TRUE),
  ('p1000000-0000-0000-0000-000000000009', 'Gants de Protection & Travail Cuir', 'gants-de-protection-travail-cuir', 'Cuir de bovin renforcé paume, anti-coupure et haute résistance', 'Gants de sécurité industrielle en cuir pleine fleur, idéal manutention, BTP et travaux lourds. Norme CE EN388.', 'c1000000-0000-0000-0000-000000000004', 'Outillage', 750, 'FCFA', 1500, 50, 'Chine', 0.22, 22, 12, 3, ARRAY['sea'], '30 - 45 jours (Mer)', 'active', TRUE, FALSE),
  ('p1000000-0000-0000-0000-000000000010', 'Parka Rembourrée Capuche Fourrure', 'parka-rembourree-capuche-fourrure', 'Isolation thermique grand froid -15°C, capuche fausse fourrure', 'Parka d''hiver matelassée haute densité, tissu imperméable résistant au vent, fermeture éclair métallique renforcée.', 'c1000000-0000-0000-0000-000000000002', 'Vêtements', 4800, 'FCFA', 250, 10, 'Chine', 1.40, 40, 30, 10, ARRAY['sea'], '30 - 45 jours (Mer)', 'active', TRUE, FALSE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_demo = EXCLUDED.is_demo,
  status = EXCLUDED.status;

-- IMAGES DES PRODUITS DÉMO
INSERT INTO public.product_images (id, product_id, public_image_url, alt_text, position, is_primary) VALUES
  ('i1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', '/images/assets/item_1.jpg', 'Montre Connectée SmartFit Pro X', 0, TRUE),
  ('i1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000002', '/images/assets/item_2.jpg', 'Écouteurs Bluetooth ANC SoundBass', 0, TRUE),
  ('i1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000003', '/images/assets/item_3.jpg', 'Casque Audio Over-Ear Wireless', 0, TRUE),
  ('i1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000004', '/images/assets/item_4.jpg', 'Baskets Urban Sport Sneaker Pro', 0, TRUE),
  ('i1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000005', '/images/assets/item_5.jpg', 'Sérum Visage Vitamine C Éclat', 0, TRUE),
  ('i1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000006', '/images/assets/item_6.jpg', 'T-Shirt Graphic Streetwear Red Edition', 0, TRUE),
  ('i1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000007', '/images/assets/item_7.jpg', 'Coffret Bijoux Doré 24k Luxury', 0, TRUE),
  ('i1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000008', '/images/assets/item_8.jpg', 'Veste Blouson Imperméable Workwear', 0, TRUE),
  ('i1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000009', '/images/assets/item_9.jpg', 'Gants de Protection & Travail Cuir', 0, TRUE),
  ('i1000000-0000-0000-0000-000000000010', 'p1000000-0000-0000-0000-000000000010', '/images/assets/item_10.jpg', 'Parka Rembourrée Capuche Fourrure', 0, TRUE)
ON CONFLICT (id) DO UPDATE SET
  public_image_url = EXCLUDED.public_image_url;

-- ============================================================================
-- ✅ FIN MIGRATION 004
-- ============================================================================

-- ============================================================================
-- CargoLink Africa — Migration 001 (IDEMPOTENTE)
-- Auth, Profiles, Rôles & Politiques RLS
-- ============================================================================
-- SÉCURITÉ : Compatible avec une base Supabase déjà existante.
-- Utilise CREATE TABLE IF NOT EXISTS, DROP TRIGGER IF EXISTS, etc.
-- N'effectue aucune suppression de données.
-- Ordre d'exécution : Doit être exécutée AVANT 002_admin_platform_schema.sql
-- ============================================================================

-- ===========================================================================
-- 1. ENUMS (Créés uniquement s'ils n'existent pas déjà)
-- ===========================================================================

DO $$ BEGIN
  CREATE TYPE public.account_type AS ENUM ('individual', 'reseller', 'business');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Type public.account_type existe déjà — ignoré.';
END $$;

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('customer', 'agent', 'logistics', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Type public.user_role existe déjà — ignoré.';
END $$;

-- ===========================================================================
-- 2. TABLE public.profiles (Créée uniquement si elle n'existe pas déjà)
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name    TEXT        NOT NULL DEFAULT 'Utilisateur',
  last_name     TEXT        NOT NULL DEFAULT 'CargoLink',
  email         TEXT        NOT NULL DEFAULT '',
  phone         TEXT,
  country       TEXT        NOT NULL DEFAULT 'Bénin',
  city          TEXT        NOT NULL DEFAULT 'Cotonou',
  account_type  TEXT        NOT NULL DEFAULT 'individual',
  role          TEXT        NOT NULL DEFAULT 'customer',
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NOTE : On utilise TEXT pour account_type et role afin d'éviter les conflits
-- de type si les enums ont été créés avec un nom différent sur votre instance.
-- Cela n'affecte pas le comportement fonctionnel.

-- ===========================================================================
-- 3. INDEX (IF NOT EXISTS disponible depuis PostgreSQL 14, Supabase ≥ 2024)
-- ===========================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role  ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ===========================================================================
-- 4. COLONNES SUPPLÉMENTAIRES (Ajoutées à la migration en une seule passe)
--    Ces colonnes sont nécessaires pour la migration 002
-- ===========================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status        TEXT        NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS notes         TEXT;

-- ===========================================================================
-- 5. FONCTION + TRIGGER : updated_at automatique
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ===========================================================================
-- 6. FONCTION + TRIGGER : Empêcher un utilisateur de se donner le rôle admin
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.prevent_profile_restricted_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Un non-admin ne peut pas modifier son propre rôle
  IF (OLD.role IS DISTINCT FROM NEW.role) AND NOT (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  ) THEN
    -- Silently revert role to previous value (no error, just ignored)
    NEW.role = OLD.role;
  END IF;

  -- L'email ne peut pas être changé via UPDATE sur profiles (il vient de auth.users)
  IF (OLD.email IS DISTINCT FROM NEW.email) THEN
    NEW.email = OLD.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS enforce_profile_restricted_updates ON public.profiles;
CREATE TRIGGER enforce_profile_restricted_updates
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_restricted_updates();

-- ===========================================================================
-- 7. FONCTION + TRIGGER : Création automatique du profil à l'inscription
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert only if profile doesn't exist (protection contre les doublons)
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    email,
    phone,
    country,
    city,
    account_type,
    role,
    avatar_url
  )
  SELECT
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'given_name', ''),
      NULLIF(split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1), ''),
      NULLIF(split_part(NEW.raw_user_meta_data->>'name', ' ', 1), ''),
      'Utilisateur'
    ),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'last_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'family_name', ''),
      NULLIF(substring(NEW.raw_user_meta_data->>'full_name' from position(' ' in COALESCE(NEW.raw_user_meta_data->>'full_name', '')) + 1), ''),
      NULLIF(substring(NEW.raw_user_meta_data->>'name' from position(' ' in COALESCE(NEW.raw_user_meta_data->>'name', '')) + 1), ''),
      'CargoLink'
    ),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'country', ''), 'Bénin'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'city', ''),    'Cotonou'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'account_type', ''), 'individual'),
    'customer',    -- Toujours 'customer' à la création — seul l'admin peut changer le rôle
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
      NULLIF(NEW.raw_user_meta_data->>'picture', '')
    )
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-confirmation automatique des emails à la création de compte
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_before_insert ON auth.users;
CREATE TRIGGER on_auth_user_before_insert
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();

-- ===========================================================================
-- 8. FONCTION HELPER : Vérifier le rôle sans récursion RLS
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.has_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role INTO current_user_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN current_user_role = ANY(required_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- ===========================================================================
-- 9. ROW LEVEL SECURITY — Activation
-- ===========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
-- 10. POLITIQUES RLS (Suppression préalable pour idempotence)
-- ===========================================================================

-- Suppression des politiques existantes (si migration ré-exécutée)
DROP POLICY IF EXISTS "Users can view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access on profiles" ON public.profiles;

-- Politique 1 : Un utilisateur authentifié peut voir son propre profil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Politique 2 : Un utilisateur peut modifier son propre profil
-- (le trigger prevent_profile_restricted_updates empêche de se donner le rôle admin)
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Politique 3 : Les admins peuvent voir tous les profils
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.has_role(ARRAY['admin', 'super_admin']));

-- Politique 4 : Les admins peuvent modifier tous les profils (ex: changer un rôle)
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(ARRAY['admin', 'super_admin']))
  WITH CHECK (public.has_role(ARRAY['admin', 'super_admin']));

-- ============================================================================
-- ✅ FIN MIGRATION 001 — Exécuter 002_admin_platform_schema.sql ensuite
-- ============================================================================

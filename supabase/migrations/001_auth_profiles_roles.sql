-- ============================================================================
-- CargoLink Africa — Migration 001: Auth, Profiles, Roles & Security RLS
-- ============================================================================

-- 1. Create Enums
CREATE TYPE public.account_type AS ENUM ('individual', 'reseller', 'business');
CREATE TYPE public.user_role AS ENUM ('customer', 'agent', 'logistics', 'admin', 'super_admin');

-- 2. Create Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  city TEXT,
  account_type public.account_type NOT NULL DEFAULT 'individual',
  role public.user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast query lookups
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- 3. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Prevent Role & Email Self-Modification Trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_restricted_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Non-admins cannot alter their role
  IF (OLD.role != NEW.role) AND NOT (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  ) THEN
    NEW.role = OLD.role;
  END IF;

  -- Email must remain in sync with auth.users
  IF (OLD.email != NEW.email) THEN
    NEW.email = OLD.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_profile_restricted_updates
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_restricted_updates();

-- 5. Auto-Create Profile on Signup Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta_account_type public.account_type;
BEGIN
  -- Safe conversion for account_type metadata
  BEGIN
    meta_account_type := (NEW.raw_user_meta_data->>'account_type')::public.account_type;
  EXCEPTION WHEN OTHERS THEN
    meta_account_type := 'individual'::public.account_type;
  END;

  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    email,
    phone,
    country,
    city,
    account_type,
    role
  ) VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'first_name', ''), 'Utilisateur'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'last_name', ''), 'CargoLink'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'country', ''), 'Bénin'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'city', ''), 'Cotonou'),
    COALESCE(meta_account_type, 'individual'::public.account_type),
    'customer'::public.user_role -- Always forces customer role!
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Helper Function: Check User Role Without RLS Recursion
CREATE OR REPLACE FUNCTION public.has_role(required_roles public.user_role[])
RETURNS BOOLEAN AS $$
DECLARE
  current_user_role public.user_role;
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

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated user can SELECT own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Authenticated user can UPDATE own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Admins can SELECT all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.has_role(ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]));

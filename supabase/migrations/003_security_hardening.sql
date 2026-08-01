-- ============================================================================
-- CargoLink Africa — Migration 003 (IDEMPOTENTE — CORRIGÉE)
-- Renforcement de la Sécurité Auth, Profils & Statuts de Compte
-- ============================================================================
-- PRÉREQUIS : Les migrations 001 et 002 doivent avoir été exécutées au préalable.
-- Ne pas exécuter directement sans validation préalable de l'administrateur.
-- ============================================================================

-- 1. MISE À JOUR DU TRIGGER POUR PROTÉGER LE RÔLE, LE STATUT ET L'EMAIL
-- - Si auth.uid() IS NULL (SQL Editor, migration, service role) : modification autorisée.
-- - Si auth.uid() IS NOT NULL (utilisateur connecté) :
--     - admin / super_admin : modification autorisée.
--     - utilisateur normal : restauration granulaire des champs modifiés (OLD.role, OLD.status, OLD.email).
CREATE OR REPLACE FUNCTION public.prevent_profile_restricted_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_is_admin BOOLEAN := FALSE;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.profiles AS requester
      WHERE requester.id = auth.uid()
        AND requester.role IN ('admin', 'super_admin')
    )
    INTO requester_is_admin;
  END IF;

  -- Protection granulaire du rôle
  IF OLD.role IS DISTINCT FROM NEW.role
     AND auth.uid() IS NOT NULL
     AND NOT requester_is_admin THEN
    NEW.role := OLD.role;
  END IF;

  -- Protection granulaire du statut de compte
  IF OLD.status IS DISTINCT FROM NEW.status
     AND auth.uid() IS NOT NULL
     AND NOT requester_is_admin THEN
    NEW.status := OLD.status;
  END IF;

  -- Protection granulaire de l'email
  IF OLD.email IS DISTINCT FROM NEW.email
     AND auth.uid() IS NOT NULL
     AND NOT requester_is_admin THEN
    NEW.email := OLD.email;
  END IF;

  RETURN NEW;
END;
$$;

-- Réattachement idempotent du trigger
DROP TRIGGER IF EXISTS enforce_profile_restricted_updates ON public.profiles;
CREATE TRIGGER enforce_profile_restricted_updates
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_restricted_updates();

-- ============================================================================
-- ✅ FIN MIGRATION 003
-- ============================================================================

-- =============================================================================
-- Supabase Roles & Permissions - Church Donations Platform
-- =============================================================================
-- Execute this script in: Supabase Dashboard → SQL Editor
-- Based on: https://supabase.com/docs/guides/database/postgres/roles
--           https://supabase.com/docs/guides/database/postgres/row-level-security
--
-- Architecture:
-- - anon: Public read (catalog), INSERT donations. Used by PostgREST when no JWT.
-- - authenticated: Not used (app uses iron-session for admin).
-- - service_role: Bypasses RLS. Used by Drizzle (DATABASE_URL) and Storage.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ENABLE RLS ON ALL PUBLIC TABLES
-- -----------------------------------------------------------------------------
-- RLS is mandatory for tables in exposed schemas. Without it, anon key can read all.
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pix_settings ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. DROP EXISTING POLICIES (idempotent)
-- -----------------------------------------------------------------------------
-- Categories
DROP POLICY IF EXISTS "anon_select_categories" ON public.categories;

-- Products
DROP POLICY IF EXISTS "anon_select_published_products" ON public.products;

-- Product categories (join table)
DROP POLICY IF EXISTS "anon_select_product_categories" ON public.product_categories;

-- Donations
DROP POLICY IF EXISTS "anon_insert_donations" ON public.donations;

-- PIX settings
DROP POLICY IF EXISTS "anon_select_pix_settings" ON public.pix_settings;

-- -----------------------------------------------------------------------------
-- 3. CREATE RLS POLICIES
-- -----------------------------------------------------------------------------
-- Use TO clause for performance (prevents policy evaluation for wrong roles).
-- service_role bypasses RLS by default; no policies needed for admin operations.

-- Categories: public read (catalog)
CREATE POLICY "anon_select_categories"
  ON public.categories
  FOR SELECT
  TO anon
  USING (true);

-- Products: only published items visible to public
CREATE POLICY "anon_select_published_products"
  ON public.products
  FOR SELECT
  TO anon
  USING (is_published = true);

-- Product categories: public read for catalog filtering
CREATE POLICY "anon_select_product_categories"
  ON public.product_categories
  FOR SELECT
  TO anon
  USING (true);

-- Donations: public can insert only for published products (donation form).
-- Restricts inserts to products that exist and are published; prevents abuse.
CREATE POLICY "anon_insert_donations"
  ON public.donations
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.is_published = true
    )
  );

-- PIX settings: public read (QR code, copia e cola on donation page)
CREATE POLICY "anon_select_pix_settings"
  ON public.pix_settings
  FOR SELECT
  TO anon
  USING (true);

-- -----------------------------------------------------------------------------
-- 4. GRANT TABLE PERMISSIONS
-- -----------------------------------------------------------------------------
-- anon needs explicit GRANT for PostgREST to allow operations.
-- authenticated: no grants (not used).
-- service_role: has full access by default.

GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.product_categories TO anon;
GRANT INSERT ON public.donations TO anon;
GRANT SELECT ON public.pix_settings TO anon;

-- Required for INSERT with default/sequence
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- -----------------------------------------------------------------------------
-- 5. INDEXES FOR RLS PERFORMANCE (optional but recommended)
-- -----------------------------------------------------------------------------
-- Index columns used in policy USING clauses. products.is_published is used.
CREATE INDEX IF NOT EXISTS idx_products_is_published
  ON public.products (is_published)
  WHERE is_published = true;

-- -----------------------------------------------------------------------------
-- 6. AUTO-ENABLE RLS ON NEW TABLES (optional)
-- -----------------------------------------------------------------------------
-- Event trigger: any new table in public schema gets RLS enabled automatically.
-- Safe to run; skips system schemas.

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
RETURNS EVENT_TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table', 'partitioned table')
  LOOP
    IF cmd.schema_name IS NOT NULL
       AND cmd.schema_name = 'public'
       AND cmd.schema_name NOT IN ('pg_catalog', 'information_schema')
       AND cmd.schema_name NOT LIKE 'pg_toast%'
       AND cmd.schema_name NOT LIKE 'pg_temp%'
    THEN
      BEGIN
        EXECUTE format('ALTER TABLE IF EXISTS %s ENABLE ROW LEVEL SECURITY', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed on % - %', cmd.object_identity, SQLERRM;
      END;
    END IF;
  END LOOP;
END;
$$;

DROP EVENT TRIGGER IF EXISTS ensure_rls_on_new_tables;
CREATE EVENT TRIGGER ensure_rls_on_new_tables
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION public.rls_auto_enable();

-- -----------------------------------------------------------------------------
-- 7. STORAGE POLICIES (if not already in seed.sql)
-- -----------------------------------------------------------------------------
-- Uncomment if you need to (re)apply storage RLS. Otherwise use supabase/seed.sql
-- or supabase/storage-rls-fix.sql.

/*
-- pix-qr bucket
DROP POLICY IF EXISTS "Allow all uploads to pix-qr" ON storage.objects;
DROP POLICY IF EXISTS "Allow all update to pix-qr" ON storage.objects;
CREATE POLICY "Allow all uploads to pix-qr" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pix-qr');
CREATE POLICY "Allow all update to pix-qr" ON storage.objects
  FOR UPDATE USING (bucket_id = 'pix-qr') WITH CHECK (bucket_id = 'pix-qr');

-- receipts bucket
DROP POLICY IF EXISTS "Allow all uploads to receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow all update to receipts" ON storage.objects;
CREATE POLICY "Allow all uploads to receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'receipts');
CREATE POLICY "Allow all update to receipts" ON storage.objects
  FOR UPDATE USING (bucket_id = 'receipts') WITH CHECK (bucket_id = 'receipts');
*/

-- =============================================================================
-- DONE. Verify with:
--   SELECT * FROM pg_policies WHERE schemaname = 'public';
-- =============================================================================

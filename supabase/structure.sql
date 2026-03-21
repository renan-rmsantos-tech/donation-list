-- =============================================================================
-- Church Donations Platform - Script de Inicialização Completa
-- =============================================================================
-- Use este script para criar a base do zero e preencher com dados iniciais.
-- Pode ser executado no Supabase Dashboard → SQL Editor
-- ou via: psql $DATABASE_URL -f supabase/init-from-scratch.sql
--
-- ATENÇÃO: Este script DROP e recria as tabelas. Use apenas em ambiente novo
-- ou quando quiser resetar completamente.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. LIMPAR OBJETOS EXISTENTES (cuidado em produção!)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.fund_transfers CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.product_categories CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.pix_settings CASCADE;
DROP TYPE IF EXISTS public.donation_type CASCADE;

-- -----------------------------------------------------------------------------
-- 2. SCHEMA
-- -----------------------------------------------------------------------------
CREATE TYPE public.donation_type AS ENUM('monetary', 'physical');

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  target_amount integer,
  current_amount integer DEFAULT 0 NOT NULL,
  is_fulfilled boolean DEFAULT false NOT NULL,
  is_published boolean DEFAULT true NOT NULL,
  image_path text,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  donation_type public.donation_type NOT NULL,
  amount integer,
  donor_name text,
  donor_phone text,
  donor_email text,
  receipt_path text,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE public.pix_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_image_path text,
  copia_e_cola_code text,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE public.product_categories (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE TABLE public.fund_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  target_product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  amount integer NOT NULL,
  admin_username text NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX fund_transfers_created_at_idx ON public.fund_transfers(created_at);
CREATE INDEX fund_transfers_source_product_id_idx ON public.fund_transfers(source_product_id);
CREATE INDEX fund_transfers_target_product_id_idx ON public.fund_transfers(target_product_id);

-- -----------------------------------------------------------------------------
-- 3. STORAGE BUCKETS (se storage existir)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES
  ('receipts', 'receipts', false, false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('pix-qr', 'pix-qr', true, false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. STORAGE RLS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow all uploads to receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow all update to receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads to pix-qr" ON storage.objects;
DROP POLICY IF EXISTS "Allow all update to pix-qr" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;

CREATE POLICY "Allow all uploads to receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Allow all update to receipts" ON storage.objects
  FOR UPDATE USING (bucket_id = 'receipts') WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'receipts');

CREATE POLICY "Allow all uploads to pix-qr" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pix-qr');

CREATE POLICY "Allow all update to pix-qr" ON storage.objects
  FOR UPDATE USING (bucket_id = 'pix-qr') WITH CHECK (bucket_id = 'pix-qr');

CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'pix-qr');

-- -----------------------------------------------------------------------------
-- 5. RLS E PERMISSÕES (tabelas public)
-- -----------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pix_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON public.categories;
DROP POLICY IF EXISTS "anon_select_published_products" ON public.products;
DROP POLICY IF EXISTS "anon_select_product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "anon_insert_donations" ON public.donations;
DROP POLICY IF EXISTS "anon_select_pix_settings" ON public.pix_settings;

CREATE POLICY "anon_select_categories" ON public.categories FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_published_products" ON public.products FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "anon_select_product_categories" ON public.product_categories FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_donations" ON public.donations FOR INSERT TO anon
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_published = true));
CREATE POLICY "anon_select_pix_settings" ON public.pix_settings FOR SELECT TO anon USING (true);

GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.product_categories TO anon;
GRANT INSERT ON public.donations TO anon;
GRANT SELECT ON public.pix_settings TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

CREATE INDEX IF NOT EXISTS idx_products_is_published ON public.products (is_published) WHERE is_published = true;

-- Event trigger: RLS automático em novas tabelas public
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
    SELECT * FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table', 'partitioned table')
  LOOP
    IF cmd.schema_name = 'public' THEN
      BEGIN
        EXECUTE format('ALTER TABLE IF EXISTS %s ENABLE ROW LEVEL SECURITY', cmd.object_identity);
      EXCEPTION WHEN OTHERS THEN
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

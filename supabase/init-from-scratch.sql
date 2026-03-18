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

-- -----------------------------------------------------------------------------
-- 6. SEED: Categorias e Produtos Colégio São José
-- -----------------------------------------------------------------------------
INSERT INTO public.categories (name) VALUES
  ('Colégio'),
  ('Sacristia'),
  ('Capela Nossa Senhora Aparecida'),
  ('Propriedade'),
  ('Casa dos padres')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.products (id, name, description, target_amount, current_amount, is_fulfilled, is_published) VALUES
  ('b2c3d4e5-0001-4000-8000-000000000001', 'Multifuncional Impressora Epson Workforce WF-C5810', 'Impressora multifuncional colorida com sistema de tinta substituível, velocidade de 25 ppm, conectividade Wi-Fi e Ethernet. Ideal para ambiente escolar com alto volume de impressão.', 350000, 0, false, true),
  ('b2c3d4e5-0002-4000-8000-000000000002', 'Porta copos de bebedouro', 'Suporte organizador em metal para copos descartáveis de 180-200ml, fixação em bebedouro ou parede, uso coletivo.', 8000, 0, false, true),
  ('b2c3d4e5-0003-4000-8000-000000000003', 'Uma losa', 'Losa/lousa branca para sala de aula, superfície para escrita com marcadores apagáveis, moldura em alumínio.', 45000, 0, false, true),
  ('b2c3d4e5-0004-4000-8000-000000000004', '7 bolsas de mensualidade', 'Auxílio financeiro para estudantes em situação de vulnerabilidade socioeconômica, cobertura de mensalidade escolar.', 700000, 0, false, true),
  ('b2c3d4e5-0005-4000-8000-000000000005', 'Um bebedouro', 'Bebedouro de coluna refrigerado, filtro de água, capacidade para uso intenso em ambiente escolar.', 120000, 0, false, true),
  ('b2c3d4e5-0006-4000-8000-000000000006', 'Paramentos (todas as cores)', 'Conjunto completo de paramentos litúrgicos nas cores: branco, vermelho, verde, roxo e preto. Inclui casulas, estolas e véus de cálice para celebrações do ano litúrgico.', 250000, 0, false, true),
  ('b2c3d4e5-0007-4000-8000-000000000007', 'Um turíbulo', 'Incensário suspenso por correntes em metal dourado ou prateado, utilizado para incensar o altar e procissões durante missas solenes.', 45000, 0, false, true),
  ('b2c3d4e5-0008-4000-8000-000000000008', 'Móvel para sacristia', 'Armário ou cômoda em madeira para organização e guarda de paramentos, alfaias e objetos litúrgicos.', 180000, 0, false, true),
  ('b2c3d4e5-0009-4000-8000-000000000009', 'Candelabros para os acólitos', 'Par de candelabros em metal (latão ou bronze) com acabamento dourado, altura adequada para procissões e cerimônias com acólitos.', 60000, 0, false, true),
  ('b2c3d4e5-0010-4000-8000-000000000010', 'Mesa de comunhão', 'Mesa em madeira nobre ou MDF com acabamento litúrgico, utilizada para distribuição da comunhão durante celebrações.', 90000, 0, false, true),
  ('b2c3d4e5-0011-4000-8000-000000000011', 'Bancos para a capela', 'Conjunto de bancos em madeira com encosto, capacidade para 8-10 pessoas por banco, acabamento envernizado.', 350000, 0, false, true),
  ('b2c3d4e5-0012-4000-8000-000000000012', 'Trator de cortar grama', 'Trator cortador de grama tipo ride-on, motor a gasolina, largura de corte 90-120cm, ideal para grandes áreas e campos escolares.', 1200000, 0, false, true),
  ('b2c3d4e5-0013-4000-8000-000000000013', 'Motosserra', 'Motosserra a gasolina, potência 2-3 HP, sabre de 16-18 polegadas, para corte de árvores e manutenção de área verde.', 180000, 0, false, true),
  ('b2c3d4e5-0014-4000-8000-000000000014', 'Podadora elétrica', 'Podadora/eletrosserra portátil, bateria recarregável ou elétrica com fio, lâmina 100-250mm para poda de galhos e arbustos.', 80000, 0, false, true),
  ('b2c3d4e5-0015-4000-8000-000000000015', 'Chaleira elétrica', 'Chaleira elétrica em aço inoxidável, capacidade 1.5-2 litros, desligamento automático, base giratória 360°.', 15000, 0, false, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id) VALUES
  ('b2c3d4e5-0001-4000-8000-000000000001', (SELECT id FROM public.categories WHERE name = 'Colégio' LIMIT 1)),
  ('b2c3d4e5-0002-4000-8000-000000000002', (SELECT id FROM public.categories WHERE name = 'Colégio' LIMIT 1)),
  ('b2c3d4e5-0003-4000-8000-000000000003', (SELECT id FROM public.categories WHERE name = 'Colégio' LIMIT 1)),
  ('b2c3d4e5-0004-4000-8000-000000000004', (SELECT id FROM public.categories WHERE name = 'Colégio' LIMIT 1)),
  ('b2c3d4e5-0005-4000-8000-000000000005', (SELECT id FROM public.categories WHERE name = 'Colégio' LIMIT 1)),
  ('b2c3d4e5-0006-4000-8000-000000000006', (SELECT id FROM public.categories WHERE name = 'Sacristia' LIMIT 1)),
  ('b2c3d4e5-0007-4000-8000-000000000007', (SELECT id FROM public.categories WHERE name = 'Sacristia' LIMIT 1)),
  ('b2c3d4e5-0008-4000-8000-000000000008', (SELECT id FROM public.categories WHERE name = 'Sacristia' LIMIT 1)),
  ('b2c3d4e5-0009-4000-8000-000000000009', (SELECT id FROM public.categories WHERE name = 'Capela Nossa Senhora Aparecida' LIMIT 1)),
  ('b2c3d4e5-0010-4000-8000-000000000010', (SELECT id FROM public.categories WHERE name = 'Capela Nossa Senhora Aparecida' LIMIT 1)),
  ('b2c3d4e5-0011-4000-8000-000000000011', (SELECT id FROM public.categories WHERE name = 'Capela Nossa Senhora Aparecida' LIMIT 1)),
  ('b2c3d4e5-0012-4000-8000-000000000012', (SELECT id FROM public.categories WHERE name = 'Propriedade' LIMIT 1)),
  ('b2c3d4e5-0013-4000-8000-000000000013', (SELECT id FROM public.categories WHERE name = 'Propriedade' LIMIT 1)),
  ('b2c3d4e5-0014-4000-8000-000000000014', (SELECT id FROM public.categories WHERE name = 'Propriedade' LIMIT 1)),
  ('b2c3d4e5-0015-4000-8000-000000000015', (SELECT id FROM public.categories WHERE name = 'Casa dos padres' LIMIT 1))
ON CONFLICT (product_id, category_id) DO NOTHING;

COMMIT;

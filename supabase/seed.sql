-- =============================================================================
-- Supabase Setup Unificado - Church Donations Platform
-- =============================================================================
-- Executado automaticamente em: supabase db reset
-- Ou manualmente em: Supabase Dashboard → SQL Editor
--
-- Ordem: 1) Storage 2) RLS Public 3) Schema 4) Seed
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. STORAGE BUCKETS
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES
  (
    'receipts',
    'receipts',
    false,
    false,
    52428800,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  ),
  (
    'pix-qr',
    'pix-qr',
    true,
    false,
    52428800,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. STORAGE RLS POLICIES
-- -----------------------------------------------------------------------------
-- Policies sem TO aplicam a todos os roles (anon, authenticated, service_role)
-- Necessário para uploads server-side com SUPABASE_SERVICE_ROLE_KEY

-- receipts bucket (privado)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon uploads to receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon update to receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads to receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow all update to receipts" ON storage.objects;

CREATE POLICY "Allow all uploads to receipts" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Allow all update to receipts" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'receipts')
  WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'receipts');

-- pix-qr bucket (público)
DROP POLICY IF EXISTS "Allow authenticated uploads to pix-qr" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon uploads to pix-qr" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon update to pix-qr" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads to pix-qr" ON storage.objects;
DROP POLICY IF EXISTS "Allow all update to pix-qr" ON storage.objects;

CREATE POLICY "Allow all uploads to pix-qr" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'pix-qr');

CREATE POLICY "Allow all update to pix-qr" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'pix-qr')
  WITH CHECK (bucket_id = 'pix-qr');

CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'pix-qr');

-- -----------------------------------------------------------------------------
-- 3. RLS E PERMISSÕES (TABELAS PUBLIC)
-- -----------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pix_settings ENABLE ROW LEVEL SECURITY;

-- Drop policies existentes (idempotente)
DROP POLICY IF EXISTS "anon_select_categories" ON public.categories;
DROP POLICY IF EXISTS "anon_select_published_products" ON public.products;
DROP POLICY IF EXISTS "anon_select_product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "anon_insert_donations" ON public.donations;
DROP POLICY IF EXISTS "anon_select_pix_settings" ON public.pix_settings;

-- Criar policies
CREATE POLICY "anon_select_categories"
  ON public.categories FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_published_products"
  ON public.products FOR SELECT TO anon USING (is_published = true);

CREATE POLICY "anon_select_product_categories"
  ON public.product_categories FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_donations"
  ON public.donations FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.is_published = true
    )
  );

CREATE POLICY "anon_select_pix_settings"
  ON public.pix_settings FOR SELECT TO anon USING (true);

-- Grants
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.product_categories TO anon;
GRANT INSERT ON public.donations TO anon;
GRANT SELECT ON public.pix_settings TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Índice para performance RLS
CREATE INDEX IF NOT EXISTS idx_products_is_published
  ON public.products (is_published)
  WHERE is_published = true;

-- Event trigger: RLS automático em novas tabelas
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
-- 4. SCHEMA (colunas adicionais)
-- -----------------------------------------------------------------------------
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "image_path" text;

-- -----------------------------------------------------------------------------
-- 5. SEED: Categorias e Produtos Colégio São José
-- -----------------------------------------------------------------------------
INSERT INTO categories (name) VALUES
  ('Colégio'),
  ('Sacristia'),
  ('Capela Nossa Senhora Aparecida'),
  ('Propriedade'),
  ('Casa dos padres')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (id, name, description, target_amount, current_amount, is_fulfilled, is_published) VALUES
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

INSERT INTO product_categories (product_id, category_id) VALUES
  ('b2c3d4e5-0001-4000-8000-000000000001', (SELECT id FROM categories WHERE name = 'Colégio' LIMIT 1)),
  ('b2c3d4e5-0002-4000-8000-000000000002', (SELECT id FROM categories WHERE name = 'Colégio' LIMIT 1)),
  ('b2c3d4e5-0003-4000-8000-000000000003', (SELECT id FROM categories WHERE name = 'Colégio' LIMIT 1)),
  ('b2c3d4e5-0004-4000-8000-000000000004', (SELECT id FROM categories WHERE name = 'Colégio' LIMIT 1)),
  ('b2c3d4e5-0005-4000-8000-000000000005', (SELECT id FROM categories WHERE name = 'Colégio' LIMIT 1)),
  ('b2c3d4e5-0006-4000-8000-000000000006', (SELECT id FROM categories WHERE name = 'Sacristia' LIMIT 1)),
  ('b2c3d4e5-0007-4000-8000-000000000007', (SELECT id FROM categories WHERE name = 'Sacristia' LIMIT 1)),
  ('b2c3d4e5-0008-4000-8000-000000000008', (SELECT id FROM categories WHERE name = 'Sacristia' LIMIT 1)),
  ('b2c3d4e5-0009-4000-8000-000000000009', (SELECT id FROM categories WHERE name = 'Capela Nossa Senhora Aparecida' LIMIT 1)),
  ('b2c3d4e5-0010-4000-8000-000000000010', (SELECT id FROM categories WHERE name = 'Capela Nossa Senhora Aparecida' LIMIT 1)),
  ('b2c3d4e5-0011-4000-8000-000000000011', (SELECT id FROM categories WHERE name = 'Capela Nossa Senhora Aparecida' LIMIT 1)),
  ('b2c3d4e5-0012-4000-8000-000000000012', (SELECT id FROM categories WHERE name = 'Propriedade' LIMIT 1)),
  ('b2c3d4e5-0013-4000-8000-000000000013', (SELECT id FROM categories WHERE name = 'Propriedade' LIMIT 1)),
  ('b2c3d4e5-0014-4000-8000-000000000014', (SELECT id FROM categories WHERE name = 'Propriedade' LIMIT 1)),
  ('b2c3d4e5-0015-4000-8000-000000000015', (SELECT id FROM categories WHERE name = 'Casa dos padres' LIMIT 1))
ON CONFLICT (product_id, category_id) DO NOTHING;

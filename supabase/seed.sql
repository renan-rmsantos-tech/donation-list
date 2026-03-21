-- =============================================================================
-- Backup de dados (público) — gerado a partir do Postgres do projeto Supabase.
-- Executado após migrations em `supabase db reset` (ver config.toml [db.seed]).
-- =============================================================================

-- Ordem respeita FKs: categories → products → pix_settings → product_categories

INSERT INTO public.categories (id, name, created_at, updated_at) VALUES
  ('5795eebc-ced6-4d13-bbf1-6534e32c9cd1', 'Colégio', '2026-03-18 02:59:38.180675', '2026-03-18 02:59:38.180675'),
  ('9df1a5da-2526-4cdd-976d-3944ca093e94', 'Sacristia', '2026-03-18 02:59:38.180675', '2026-03-18 02:59:38.180675'),
  ('862a2014-262f-4c71-bbc0-b027fadc7fe2', 'Capela Nossa Senhora Aparecida', '2026-03-18 02:59:38.180675', '2026-03-18 02:59:38.180675'),
  ('b8fcdcff-ec22-46dd-a3a5-1bf651f21375', 'Propriedade', '2026-03-18 02:59:38.180675', '2026-03-18 02:59:38.180675'),
  ('78f8d374-de7a-4076-9740-89495a430a3b', 'Casa dos padres', '2026-03-18 02:59:38.180675', '2026-03-18 02:59:38.180675')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (
  id, name, description, target_amount, current_amount, is_fulfilled, is_published, image_path, created_at, updated_at
) VALUES
  (
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Multifuncional Impressora Epson Workforce WF-C5810',
    'Impressora multifuncional colorida com sistema de tinta substituível, velocidade de 25 ppm, conectividade Wi-Fi e Ethernet. Ideal para ambiente escolar com alto volume de impressão.',
    350000,
    0,
    false,
    true,
    NULL,
    '2026-03-18 02:59:38.180675',
    '2026-03-20 19:14:40.438'
  ),
  (
    'b2c3d4e5-0002-4000-8000-000000000002',
    'Porta copos de bebedouro',
    'Suporte organizador em metal para copos descartáveis de 180-200ml, fixação em bebedouro ou parede, uso coletivo.',
    8000,
    0,
    false,
    true,
    NULL,
    '2026-03-18 02:59:38.180675',
    '2026-03-18 02:59:38.180675'
  ),
  (
    'b2c3d4e5-0003-4000-8000-000000000003',
    'Uma losa',
    'Losa/lousa branca para sala de aula, superfície para escrita com marcadores apagáveis, moldura em alumínio.',
    45000,
    0,
    false,
    true,
    NULL,
    '2026-03-18 02:59:38.180675',
    '2026-03-18 02:59:38.180675'
  ),
  (
    'b2c3d4e5-0004-4000-8000-000000000004',
    '1 bolsas escolar',
    'Auxílio financeiro para estudantes, cobertura da anuidade escolar.',
    1560000,
    0,
    false,
    true,
    NULL,
    '2026-03-18 02:59:38.180675',
    '2026-03-20 19:08:28.563'
  ),
  (
    'b2c3d4e5-0005-4000-8000-000000000005',
    'Um bebedouro',
    'Bebedouro de coluna refrigerado, filtro de água, capacidade para uso intenso em ambiente escolar.',
    120000,
    0,
    false,
    true,
    NULL,
    '2026-03-18 02:59:38.180675',
    '2026-03-18 02:59:38.180675'
  ),
  (
    'b2c3d4e5-0007-4000-8000-000000000007',
    'Um turíbulo',
    'Incensário suspenso por correntes em metal dourado ou prateado, utilizado para incensar o altar e procissões durante missas solenes.',
    45000,
    0,
    false,
    true,
    NULL,
    '2026-03-18 02:59:38.180675',
    '2026-03-18 02:59:38.180675'
  ),
  (
    'b2c3d4e5-0008-4000-8000-000000000008',
    'Móvel para sacristia',
    'Armário ou cômoda em madeira para organização e guarda de paramentos, alfaias e objetos litúrgicos.',
    180000,
    0,
    false,
    true,
    NULL,
    '2026-03-18 02:59:38.180675',
    '2026-03-18 02:59:38.180675'
  ),
  (
    'b2c3d4e5-0009-4000-8000-000000000009',
    'Candelabros para os acólitos',
    'Par de candelabros em metal (latão ou bronze) com acabamento dourado, altura adequada para procissões e cerimônias com acólitos.',
    60000,
    0,
    false,
    true,
    NULL,
    '2026-03-18 02:59:38.180675',
    '2026-03-18 02:59:38.180675'
  ),
  (
    'b2c3d4e5-0012-4000-8000-000000000012',
    'Trator de cortar grama',
    'Trator cortador de grama tipo ride-on, motor a gasolina, largura de corte 90-120cm, ideal para grandes áreas e campos escolares.',
    1500000,
    0,
    false,
    true,
    NULL,
    '2026-03-18 02:59:38.180675',
    '2026-03-20 19:14:40.579'
  ),
  (
    'b2c3d4e5-0013-4000-8000-000000000013',
    'Motosserra',
    'Motosserra a gasolina, potência 2-3 HP, sabre de 16-18 polegadas, para corte de árvores e manutenção de área verde.',
    180000,
    0,
    false,
    true,
    NULL,
    '2026-03-18 02:59:38.180675',
    '2026-03-18 02:59:38.180675'
  ),
  (
    'b2c3d4e5-0014-4000-8000-000000000014',
    'Podadora elétrica',
    'Podadora/eletrosserra portátil, bateria recarregável ou elétrica com fio, lâmina 100-250mm para poda de galhos e arbustos.',
    80000,
    0,
    false,
    true,
    NULL,
    '2026-03-18 02:59:38.180675',
    '2026-03-18 02:59:38.180675'
  ),
  (
    'b2c3d4e5-0015-4000-8000-000000000015',
    'Chaleira elétrica',
    'Chaleira elétrica em aço inoxidável, capacidade 1.5-2 litros, desligamento automático, base giratória 360°.',
    15000,
    0,
    false,
    true,
    NULL,
    '2026-03-18 02:59:38.180675',
    '2026-03-18 02:59:38.180675'
  ),
  (
    '21eb50a9-4616-4590-ad5d-0a8de3dd3819',
    '1 bolsa escolar',
    'Auxílio financeiro para estudantes, cobertura da anuidade escolar.',
    1560000,
    0,
    false,
    true,
    NULL,
    '2026-03-20 19:05:28.653821',
    '2026-03-20 19:09:15.609'
  ),
  (
    '457fc0e1-d706-4e37-b05b-82189d1fdac9',
    '1 bolsa escolar',
    'Auxílio financeiro para estudantes, cobertura da anuidade escolar.',
    1560000,
    0,
    false,
    true,
    NULL,
    '2026-03-20 19:08:07.302409',
    '2026-03-20 19:10:47.403'
  ),
  (
    'cd75ea84-3279-45c2-9ed4-8131919805d4',
    '1 bolsa escolar',
    'Auxílio financeiro para estudantes, cobertura da anuidade escolar.',
    1560000,
    0,
    false,
    true,
    NULL,
    '2026-03-20 19:09:37.714115',
    '2026-03-20 19:10:21.301'
  ),
  (
    '753a7340-071f-4279-b16a-eaaad5fb9544',
    '1 bolsa escolar',
    'Auxílio financeiro para estudantes, cobertura da anuidade escolar.',
    1560000,
    0,
    false,
    true,
    NULL,
    '2026-03-20 19:10:12.335518',
    '2026-03-20 19:10:12.335518'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.pix_settings (id, qr_code_image_path, copia_e_cola_code, updated_at) VALUES
  (
    'a8fbcb01-8e3a-4579-a4b9-58f0cbce8566',
    'pix-qr/2026-03-21-d328ff708d39cfad2c370c35764fabfc.jpeg',
    '00020126580014br.gov.bcb.pix01366c57e439-9341-4fab-8648-8b0c440645135204000053039865802BR5925ACIPEC ASSOCIACAO CIVIL P6009SAO PAULO622605225uuWZBAlSSLO9f2izsl4kh63047166',
    '2026-03-21 17:10:47.876'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id) VALUES
  ('21eb50a9-4616-4590-ad5d-0a8de3dd3819', '5795eebc-ced6-4d13-bbf1-6534e32c9cd1'),
  ('457fc0e1-d706-4e37-b05b-82189d1fdac9', '5795eebc-ced6-4d13-bbf1-6534e32c9cd1'),
  ('753a7340-071f-4279-b16a-eaaad5fb9544', '5795eebc-ced6-4d13-bbf1-6534e32c9cd1'),
  ('b2c3d4e5-0001-4000-8000-000000000001', '5795eebc-ced6-4d13-bbf1-6534e32c9cd1'),
  ('b2c3d4e5-0002-4000-8000-000000000002', '5795eebc-ced6-4d13-bbf1-6534e32c9cd1'),
  ('b2c3d4e5-0003-4000-8000-000000000003', '5795eebc-ced6-4d13-bbf1-6534e32c9cd1'),
  ('b2c3d4e5-0004-4000-8000-000000000004', '5795eebc-ced6-4d13-bbf1-6534e32c9cd1'),
  ('b2c3d4e5-0005-4000-8000-000000000005', '5795eebc-ced6-4d13-bbf1-6534e32c9cd1'),
  ('b2c3d4e5-0007-4000-8000-000000000007', '9df1a5da-2526-4cdd-976d-3944ca093e94'),
  ('b2c3d4e5-0008-4000-8000-000000000008', '9df1a5da-2526-4cdd-976d-3944ca093e94'),
  ('b2c3d4e5-0009-4000-8000-000000000009', '862a2014-262f-4c71-bbc0-b027fadc7fe2'),
  ('b2c3d4e5-0012-4000-8000-000000000012', 'b8fcdcff-ec22-46dd-a3a5-1bf651f21375'),
  ('b2c3d4e5-0013-4000-8000-000000000013', 'b8fcdcff-ec22-46dd-a3a5-1bf651f21375'),
  ('b2c3d4e5-0014-4000-8000-000000000014', 'b8fcdcff-ec22-46dd-a3a5-1bf651f21375'),
  ('b2c3d4e5-0015-4000-8000-000000000015', '78f8d374-de7a-4076-9740-89495a430a3b'),
  ('cd75ea84-3279-45c2-9ed4-8131919805d4', '5795eebc-ced6-4d13-bbf1-6534e32c9cd1')
ON CONFLICT (product_id, category_id) DO NOTHING;

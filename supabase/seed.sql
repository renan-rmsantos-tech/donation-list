-- Create storage buckets for the application
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

-- Set up RLS policies for receipts bucket (private)
-- Policies without TO clause apply to ALL roles (anon, authenticated, service_role)
-- Required for server-side uploads using SUPABASE_SERVICE_ROLE_KEY
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

-- Set up RLS policies for pix-qr bucket (public)
CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'pix-qr');

-- Policies without TO clause for server-side uploads (service_role)
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

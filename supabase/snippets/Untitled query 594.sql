-- Fix: "new row violates row-level security policy" on storage uploads
-- Run this in Supabase Dashboard → SQL Editor if you get RLS errors on PIX/receipt uploads.
-- Uploads via signed URL come from the browser (anon role), not authenticated.

-- pix-qr bucket
CREATE POLICY "Allow anon uploads to pix-qr" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'pix-qr');

CREATE POLICY "Allow anon update to pix-qr" ON storage.objects
  FOR UPDATE TO anon
  USING (bucket_id = 'pix-qr')
  WITH CHECK (bucket_id = 'pix-qr');

-- receipts bucket
CREATE POLICY "Allow anon uploads to receipts" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Allow anon update to receipts" ON storage.objects
  FOR UPDATE TO anon
  USING (bucket_id = 'receipts')
  WITH CHECK (bucket_id = 'receipts');

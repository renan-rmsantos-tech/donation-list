-- Fix: "new row violates row-level security policy" on storage uploads
-- Run this in Supabase Dashboard → SQL Editor
-- Uploads via signed URL come from the browser (anon role), not authenticated.
-- Safe to run multiple times (drops existing policies first).

-- pix-qr bucket
DROP POLICY IF EXISTS "Allow anon uploads to pix-qr" ON storage.objects;
CREATE POLICY "Allow anon uploads to pix-qr" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'pix-qr');

DROP POLICY IF EXISTS "Allow anon update to pix-qr" ON storage.objects;
CREATE POLICY "Allow anon update to pix-qr" ON storage.objects
  FOR UPDATE TO anon
  USING (bucket_id = 'pix-qr')
  WITH CHECK (bucket_id = 'pix-qr');

-- receipts bucket
DROP POLICY IF EXISTS "Allow anon uploads to receipts" ON storage.objects;
CREATE POLICY "Allow anon uploads to receipts" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Allow anon update to receipts" ON storage.objects;
CREATE POLICY "Allow anon update to receipts" ON storage.objects
  FOR UPDATE TO anon
  USING (bucket_id = 'receipts')
  WITH CHECK (bucket_id = 'receipts');

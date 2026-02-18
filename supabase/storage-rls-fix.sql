-- Fix: "new row violates row-level security policy" on storage uploads
-- Run this in Supabase Dashboard → SQL Editor
-- Policies without TO clause apply to ALL roles (anon, authenticated, service_role, etc.)
-- Safe to run multiple times (drops existing policies first).

-- pix-qr bucket (all roles - server uploads with service_role, signed URLs with anon)
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

-- receipts bucket
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

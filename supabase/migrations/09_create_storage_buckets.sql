-- Enable storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert the 'Rehla' bucket into the storage.buckets table
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'Rehla', 
  'Rehla', 
  true, 
  false, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[];

-- Set up Storage Policies for the 'Rehla' bucket

-- 1. Public Read Access
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT
USING (bucket_id = 'Rehla');

-- 2. Authenticated Upload Access
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'Rehla' AND auth.role() = 'authenticated');

-- 3. Users can update their own files
CREATE POLICY "Users can update their own files" 
ON storage.objects FOR UPDATE
USING (bucket_id = 'Rehla' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'Rehla' AND auth.uid() = owner);

-- 4. Users can delete their own files
CREATE POLICY "Users can delete their own files" 
ON storage.objects FOR DELETE
USING (bucket_id = 'Rehla' AND auth.uid() = owner);

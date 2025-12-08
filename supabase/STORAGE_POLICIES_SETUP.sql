-- Storage bucket setup for promotional popups
-- Run these commands in Supabase SQL Editor AFTER creating the bucket

-- First, manually create the bucket via Supabase Dashboard:
-- 1. Go to Storage section
-- 2. Click "New Bucket"
-- 3. Name: popup-images
-- 4. Make it PUBLIC
-- 5. Click Create

-- Then run this SQL to set up the policies:

-- Policy 1: Allow PUBLIC to read/view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'popup-images' );

-- Policy 2: Allow ADMINS to insert/upload images
CREATE POLICY "Admin can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'popup-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 3: Allow ADMINS to update images
CREATE POLICY "Admin can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'popup-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 4: Allow ADMINS to delete images
CREATE POLICY "Admin can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'popup-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

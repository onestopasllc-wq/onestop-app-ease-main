-- Create the dealerships table
CREATE TABLE IF NOT EXISTS public.dealerships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    website_url TEXT NOT NULL,
    logo_url TEXT,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read access for active dealerships
CREATE POLICY "Allow public read access" ON public.dealerships
    FOR SELECT USING (is_active = true);

-- Policy 2: Admin full access
CREATE POLICY "Allow admin all access" ON public.dealerships
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Storage bucket setup for dealership logos (if not already handled by general policies)
-- Assuming 'popup-images' or a general public bucket is used, but specific bucket 'dealership-logos' can be created.
-- For this setup, we will reuse the pattern from STORAGE_POLICIES_SETUP.sql if the user wants separate bucket, 
-- but often a shared public bucket is easier. 
-- INSTRUCTION: Manually create a public bucket named 'dealership-logos' in Supabase Storage.

-- Policy for storage (Execute if 'dealership-logos' bucket is created)
-- Allow public to view
CREATE POLICY "Public View Dealership Logos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'dealership-logos' );

-- Allow admin to upload/update/delete
CREATE POLICY "Admin Manage Dealership Logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dealership-logos' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin Update Dealership Logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'dealership-logos' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin Delete Dealership Logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'dealership-logos' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

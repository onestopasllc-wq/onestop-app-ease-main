-- Fix RLS by using a Security Definer function
-- This bypasses RLS on the user_roles table to accurately check permissions

-- 1. Create a secure function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- This is the key: runs with superuser privileges
SET search_path = public -- Security best practice
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- 2. Drop existing policies on promotional_popups
DROP POLICY IF EXISTS "Allow admin insert" ON public.promotional_popups;
DROP POLICY IF EXISTS "Allow admin update" ON public.promotional_popups;
DROP POLICY IF EXISTS "Allow admin delete" ON public.promotional_popups;

-- 3. Recreate policies using the new secure function
CREATE POLICY "Allow admin insert"
ON public.promotional_popups FOR INSERT
TO authenticated
WITH CHECK ( is_admin() );

CREATE POLICY "Allow admin update"
ON public.promotional_popups FOR UPDATE
TO authenticated
USING ( is_admin() )
WITH CHECK ( is_admin() );

CREATE POLICY "Allow admin delete"
ON public.promotional_popups FOR DELETE
TO authenticated
USING ( is_admin() );

-- 4. Update Storage Policies as well (to prevent upload errors)
DROP POLICY IF EXISTS "Admin can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete images" ON storage.objects;

CREATE POLICY "Admin can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'popup-images' AND is_admin() );

CREATE POLICY "Admin can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'popup-images' AND is_admin() );

CREATE POLICY "Admin can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'popup-images' AND is_admin() );

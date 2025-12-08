-- 1. Grant permission to run the security function
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO service_role;

-- 2. Add missing policy: Allow admins to VIEW ALL popups (even inactive ones)
DROP POLICY IF EXISTS "Allow admin select all" ON public.promotional_popups;

CREATE POLICY "Allow admin select all"
ON public.promotional_popups FOR SELECT
TO authenticated
USING ( is_admin() );

-- 3. Ensure Update policy is 100% correct
DROP POLICY IF EXISTS "Allow admin update" ON public.promotional_popups;

CREATE POLICY "Allow admin update"
ON public.promotional_popups FOR UPDATE
TO authenticated
USING ( is_admin() )
WITH CHECK ( is_admin() );

-- 4. Double check Insert policy
DROP POLICY IF EXISTS "Allow admin insert" ON public.promotional_popups;

CREATE POLICY "Allow admin insert"
ON public.promotional_popups FOR INSERT
TO authenticated
WITH CHECK ( is_admin() );

-- 5. Double check Delete policy
DROP POLICY IF EXISTS "Allow admin delete" ON public.promotional_popups;

CREATE POLICY "Allow admin delete"
ON public.promotional_popups FOR DELETE
TO authenticated
USING ( is_admin() );

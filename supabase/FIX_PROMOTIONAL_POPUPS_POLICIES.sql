-- Fix for promotional_popups table RLS policies
-- Run this in Supabase SQL Editor to fix the UPDATE policy issue

-- First, drop the existing UPDATE policy
DROP POLICY IF EXISTS "Allow admin update" ON public.promotional_popups;

-- Recreate the UPDATE policy with both USING and WITH CHECK clauses
CREATE POLICY "Allow admin update"
    ON public.promotional_popups
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Verify the policies are correct
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'promotional_popups'
ORDER BY policyname;

-- Fix the appointments INSERT policy to allow public appointment creation
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;

-- Create a new permissive policy that allows anyone to create appointments
CREATE POLICY "Anyone can create appointments"
ON public.appointments
FOR INSERT
TO public
WITH CHECK (true);
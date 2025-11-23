-- Add state and city columns to appointments table
ALTER TABLE public.appointments 
ADD COLUMN state TEXT NOT NULL DEFAULT '',
ADD COLUMN city TEXT NOT NULL DEFAULT '';

-- Remove the default values after adding the columns
ALTER TABLE public.appointments 
ALTER COLUMN state DROP DEFAULT,
ALTER COLUMN city DROP DEFAULT;

-- Add comments to document the columns
COMMENT ON COLUMN public.appointments.state IS 'State/province where the user is located';
COMMENT ON COLUMN public.appointments.city IS 'City where the user is located';

-- Update any existing appointments to have empty strings for state and city
UPDATE public.appointments 
SET state = '', city = '' 
WHERE state IS NULL OR city IS NULL;
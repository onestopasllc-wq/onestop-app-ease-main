-- Add location column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN location TEXT NOT NULL DEFAULT 'Not specified';

-- Update the default value constraint after adding the column
ALTER TABLE public.appointments 
ALTER COLUMN location DROP DEFAULT;

-- Add a comment to document the column
COMMENT ON COLUMN public.appointments.location IS 'Country location where the user is applying from or located';
-- Allow admins to DELETE appointments
-- This migration adds a Row Level Security policy allowing users with the
-- admin role to delete rows from the appointments table.

CREATE POLICY "Admins can delete appointments"
ON public.appointments
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));
                      
-- Additional optimizations: add indexes and missing columns for Appointments
-- Add missing columns if they don't exist
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments(payment_status);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

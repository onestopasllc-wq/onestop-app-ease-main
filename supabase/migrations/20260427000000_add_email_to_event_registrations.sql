-- Add email column to event_registrations table
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS email text;

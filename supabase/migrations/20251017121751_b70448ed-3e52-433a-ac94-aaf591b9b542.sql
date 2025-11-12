-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  contact_method TEXT NOT NULL,
  services TEXT[] NOT NULL,
  description TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  file_url TEXT,
  how_heard TEXT,
  payment_status TEXT DEFAULT 'pending',
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert appointments (for bookings)
CREATE POLICY "Anyone can create appointments"
ON public.appointments
FOR INSERT
WITH CHECK (true);

-- Create policy to allow users to view their own appointments
CREATE POLICY "Users can view their own appointments"
ON public.appointments
FOR SELECT
USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Create storage bucket for appointment files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'appointment-files',
  'appointment-files',
  false,
  10485760,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
);

-- Storage policies for appointment files
CREATE POLICY "Anyone can upload appointment files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'appointment-files');

CREATE POLICY "Users can view their uploaded files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'appointment-files');
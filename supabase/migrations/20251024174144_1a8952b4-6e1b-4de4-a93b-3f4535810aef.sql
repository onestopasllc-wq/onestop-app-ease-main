-- Create working_hours table for admin to define availability
CREATE TABLE IF NOT EXISTS public.working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create blocked_dates table for holidays and breaks
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(blocked_date)
);

-- Create appointment_stats view for dashboard
CREATE OR REPLACE VIEW public.appointment_stats AS
SELECT 
  COUNT(*) FILTER (WHERE appointment_date = CURRENT_DATE) as today_count,
  COUNT(*) FILTER (WHERE appointment_date > CURRENT_DATE) as upcoming_count,
  COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_count,
  COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN 10 ELSE 0 END), 0) as total_revenue
FROM public.appointments;

-- Enable RLS on new tables
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for working_hours
CREATE POLICY "Anyone can view working hours"
  ON public.working_hours FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage working hours"
  ON public.working_hours FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for blocked_dates
CREATE POLICY "Anyone can view blocked dates"
  ON public.blocked_dates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage blocked dates"
  ON public.blocked_dates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default working hours (Monday-Friday, 9 AM - 5 PM, 30-minute slots)
INSERT INTO public.working_hours (day_of_week, start_time, end_time, slot_duration) VALUES

  (0, '07:00', '11:00', 30),
  (1, '07:00', '11:00', 30),
  (2, '07:00', '11:00', 30),
  (3, '07:00', '11:00', 30),
  (4, '07:00', '11:00', 30),
  (5, '07:00', '11:00', 30),
  (6, '07:00', '11:00', 30)

ON CONFLICT DO NOTHING;
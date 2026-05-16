-- Advanced Event Management System Setup

-- 1. Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    registration_deadline timestamp with time zone NOT NULL,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'completed')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Update event_registrations table
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.events(id);
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS email text;

-- 3. Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 4. Policies for events
CREATE POLICY "Public can view active events"
    ON public.events FOR SELECT
    USING (status = 'active');

CREATE POLICY "Admins can manage events"
    ON public.events FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- 5. Insert a default event (optional, for testing)
-- INSERT INTO public.events (title, description, registration_deadline, status)
-- VALUES ('OneStop Professional Summit 2024', 'Join us for an exclusive professional gathering.', '2024-12-31 23:59:59+00', 'active');

-- 6. Grant access
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO authenticated; -- Admin access via RLS

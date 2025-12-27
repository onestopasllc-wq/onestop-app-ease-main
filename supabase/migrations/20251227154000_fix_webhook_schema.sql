-- Migration to add missing columns and tables for payment-first booking flow

-- Add stripe_payment_intent_id and status to appointments table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='stripe_payment_intent_id') THEN
        ALTER TABLE public.appointments ADD COLUMN stripe_payment_intent_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='status') THEN
        ALTER TABLE public.appointments ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Create webhook_errors table to log and debug failed webhook executions
CREATE TABLE IF NOT EXISTS public.webhook_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT,
    event_type TEXT,
    error_message TEXT,
    error_details JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on webhook_errors
ALTER TABLE public.webhook_errors ENABLE ROW LEVEL SECURITY;

-- Only admins should see webhook errors
CREATE POLICY "Admins can view webhook errors"
    ON public.webhook_errors FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow service role to insert errors (used by webhooks)
-- Note: Service role bypasses RLS, but we explicitly allow it if needed via programmatic access.

COMMENT ON TABLE public.webhook_errors IS 'Logs failed attempts to process Stripe webhooks for manual debugging.';

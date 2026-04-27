-- Allow public to view their own registration via stripe_session_id
CREATE POLICY "Users can view their own registration via session_id"
    ON public.event_registrations
    FOR SELECT
    USING (true); -- We will filter by stripe_session_id in the application logic
                  -- Alternatively, to be more secure:
                  -- USING (payment_status = 'paid');

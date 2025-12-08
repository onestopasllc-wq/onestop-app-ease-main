-- Migration: Add promotional_popups table and storage
-- Description: Create table for managing promotional and advertisement popups

-- Create promotional_popups table
CREATE TABLE IF NOT EXISTS public.promotional_popups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('event', 'ad')),
    image_url TEXT NOT NULL,
    title TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_promotional_popups_type ON public.promotional_popups(type);
CREATE INDEX IF NOT EXISTS idx_promotional_popups_is_active ON public.promotional_popups(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_promotional_popups_updated_at
    BEFORE UPDATE ON public.promotional_popups
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.promotional_popups ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access for active popups
CREATE POLICY "Allow public read access for active popups"
    ON public.promotional_popups
    FOR SELECT
    USING (is_active = true);

-- RLS Policy: Allow authenticated admins to insert
CREATE POLICY "Allow admin insert"
    ON public.promotional_popups
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- RLS Policy: Allow authenticated admins to update
CREATE POLICY "Allow admin update"
    ON public.promotional_popups
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- RLS Policy: Allow authenticated admins to delete
CREATE POLICY "Allow admin delete"
    ON public.promotional_popups
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create storage bucket for popup images (if not exists)
-- Note: This needs to be run in Supabase dashboard or via Supabase CLI
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('popup-images', 'popup-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies (to be set in Supabase dashboard):
-- 1. Allow public read access to all files in popup-images bucket
-- 2. Allow authenticated admins to upload files
-- 3. Allow authenticated admins to update files
-- 4. Allow authenticated admins to delete files

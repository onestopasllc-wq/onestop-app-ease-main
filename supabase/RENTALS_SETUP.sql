-- Create enum for rental listing status
create type rental_listing_status as enum ('pending_payment', 'pending_approval', 'approved', 'rejected', 'archived');
create type rental_payment_status as enum ('pending', 'paid');

-- Create rental_listings table
create table if not exists public.rental_listings (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id),
    title text not null,
    description text not null,
    address text not null,
    property_type text not null,
    price numeric not null,
    features text[] default '{}',
    contact_name text not null,
    contact_phone text not null,
    contact_email text not null,
    images text[] default '{}',
    status rental_listing_status default 'pending_payment',
    payment_status rental_payment_status default 'pending',
    stripe_payment_id text,
    stripe_session_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.rental_listings enable row level security;

-- Policies

-- Public can view approved listings
create policy "Public can view approved rentals"
    on public.rental_listings for select
    using (status = 'approved');

-- Users can view their own listings (any status)
create policy "Users can view own rentals"
    on public.rental_listings for select
    using (auth.uid() = user_id);

-- Users can insert their own listings
create policy "Users can insert own rentals"
    on public.rental_listings for insert
    with check (auth.uid() = user_id);

-- Users can update their own listings (if not archived/rejected, logically)
create policy "Users can update own rentals"
    on public.rental_listings for update
    using (auth.uid() = user_id);

-- Admins can view all listings
create policy "Admins can view all rentals"
    on public.rental_listings for select
    using (
        exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    );

-- Admins can update all listings (for approval/rejection)
create policy "Admins can update all rentals"
    on public.rental_listings for update
    using (
        exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    );

-- Admins can delete listings
create policy "Admins can delete rentals"
    on public.rental_listings for delete
    using (
        exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    );


-- Storage Bucket for Rental Images
insert into storage.buckets (id, name, public)
values ('rental-images', 'rental-images', true)
on conflict (id) do nothing;

-- Storage Policies

-- Public can view images
create policy "Give public access to rental images"
    on storage.objects for select
    using ( bucket_id = 'rental-images' );

-- Authenticated users can upload images
create policy "Authenticated users can upload rental images"
    on storage.objects for insert
    with check (
        bucket_id = 'rental-images'
        and auth.role() = 'authenticated'
    );

-- User can update own images
create policy "Users can update own rental images"
    on storage.objects for update
    with check (
        bucket_id = 'rental-images'
        and auth.uid() = owner
    );

-- User can delete own images
create policy "Users can delete own rental images"
    on storage.objects for delete
    using (
        bucket_id = 'rental-images'
        and auth.uid() = owner
    );

-- Create event_registrations table
create table if not exists public.event_registrations (
    id uuid default gen_random_uuid() primary key,
    full_name text not null,
    phone_number text,
    areas_of_interest text[] default '{}',
    other_interest text,
    city_state text,
    payment_status text default 'pending',
    stripe_session_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.event_registrations enable row level security;

-- Policies
create policy "Public can insert event registrations"
    on public.event_registrations for insert
    with check (true);

create policy "Admins can view all event registrations"
    on public.event_registrations for select
    using (
        exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    );

-- Grant access to authenticated and anon users for inserting
grant insert on table public.event_registrations to anon, authenticated, service_role;
grant select on table public.event_registrations to service_role;

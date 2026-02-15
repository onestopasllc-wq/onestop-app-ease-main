-- Create admin_rentals table
create table if not exists public.admin_rentals (
    id uuid default gen_random_uuid() primary key,
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
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.admin_rentals enable row level security;

-- Policies

-- Public can view admin rentals
create policy "Public can view admin rentals"
    on public.admin_rentals for select
    using (true);

-- Admins can do everything
create policy "Admins have full access to admin_rentals"
    on public.admin_rentals
    using (
        exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    )
    with check (
        exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    );

-- Add updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_admin_rentals_updated_at
    before update on public.admin_rentals
    for each row
    execute function public.handle_updated_at();

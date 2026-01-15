-- Create health_insurance_providers table
create table if not exists public.health_insurance_providers (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    website_url text not null,
    logo_url text,
    description text,
    is_active boolean default true,
    display_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.health_insurance_providers enable row level security;

-- Create policies (reusing the same logic as other provider tables)
create policy "Enable read access for all users"
    on public.health_insurance_providers for select
    using (true);

create policy "Enable insert for admins only"
    on public.health_insurance_providers for insert
    with check (
        exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    );

create policy "Enable update for admins only"
    on public.health_insurance_providers for update
    using (
        exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    );

create policy "Enable delete for admins only"
    on public.health_insurance_providers for delete
    using (
        exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    );

-- Note: We will reuse the 'insurance-logos' bucket for storage
-- as the existing policies there cover admin access for all files in that bucket.

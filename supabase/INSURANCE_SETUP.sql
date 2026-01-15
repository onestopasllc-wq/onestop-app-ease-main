-- Create insurance_providers table
create table if not exists public.insurance_providers (
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
alter table public.insurance_providers enable row level security;

-- Create policies
create policy "Enable read access for all users"
    on public.insurance_providers for select
    using (true);

create policy "Enable insert for admins only"
    on public.insurance_providers for insert
    with check (
        exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    );

create policy "Enable update for admins only"
    on public.insurance_providers for update
    using (
        exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    );

create policy "Enable delete for admins only"
    on public.insurance_providers for delete
    using (
        exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    );

-- Create storage bucket for logos if it doesn't exist
insert into storage.buckets (id, name, public)
values ('insurance-logos', 'insurance-logos', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Give public access to insurance logos"
    on storage.objects for select
    using ( bucket_id = 'insurance-logos' );

create policy "Enable upload for admins"
    on storage.objects for insert
    with check (
        bucket_id = 'insurance-logos'
        and exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    );

create policy "Enable update for admins"
    on storage.objects for update
    with check (
        bucket_id = 'insurance-logos'
        and exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    );

create policy "Enable delete for admins"
    on storage.objects for delete
    using (
        bucket_id = 'insurance-logos'
        and exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    );

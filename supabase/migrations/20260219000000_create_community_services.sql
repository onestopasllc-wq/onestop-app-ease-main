-- Create community_services table
create table if not exists public.community_services (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    category text not null,
    description text not null,
    website_url text,
    logo_url text,
    contact_name text,
    contact_phone text,
    contact_email text,
    address text,
    is_active boolean default true,
    is_featured boolean default false,
    display_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.community_services enable row level security;

-- Policies
create policy "Public can view active community services"
    on public.community_services for select
    using (is_active = true);

create policy "Admins have full access to community_services"
    on public.community_services
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

-- Trigger for updated_at
create trigger set_community_services_updated_at
    before update on public.community_services
    for each row
    execute function public.handle_updated_at();

-- Create storage bucket for community services logos
insert into storage.buckets (id, name, public)
values ('community-services', 'community-services', true)
on conflict (id) do nothing;

-- Set up storage RLS policies
-- 1. Allow public read access to all files in community-services bucket
create policy "Community Services Public Access"
on storage.objects for select
using ( bucket_id = 'community-services' );

-- 2. Allow authenticated admins to upload files
create policy "Community Services Admin Upload"
on storage.objects for insert
with check (
    bucket_id = 'community-services' 
    and (
        exists (
            select 1 from public.user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    )
);

-- 3. Allow authenticated admins to update files
create policy "Community Services Admin Update"
on storage.objects for update
using (
    bucket_id = 'community-services' 
    and (
        exists (
            select 1 from public.user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    )
);

-- 4. Allow authenticated admins to delete files
create policy "Community Services Admin Delete"
on storage.objects for delete
using (
    bucket_id = 'community-services' 
    and (
        exists (
            select 1 from public.user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    )
);

-- Add views column to rental_listings
alter table public.rental_listings 
add column if not exists views integer default 0;

-- Function to increment views safely
create or replace function public.increment_rental_views(listing_id uuid)
returns void as $$
begin
  update public.rental_listings
  set views = views + 1
  where id = listing_id;
end;
$$ language plpgsql security definer;

-- Grant execution to public/anon so views are counted even if not logged in
grant execute on function public.increment_rental_views(uuid) to anon, authenticated, service_role;

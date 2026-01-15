-- Allow users to delete their own rental listings
drop policy if exists "Users can delete own rentals" on public.rental_listings;

create policy "Users can delete own rentals"
    on public.rental_listings for delete
    using (auth.uid() = user_id);

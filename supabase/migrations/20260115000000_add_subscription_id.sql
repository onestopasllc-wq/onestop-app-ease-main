-- Add subscription_id to rental_listings table to track Stripe subscriptions
alter table public.rental_listings 
add column if not exists subscription_id text;

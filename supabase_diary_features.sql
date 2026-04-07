-- Diary feature schema notes.
-- Run these in Supabase SQL editor before enabling strict DB-backed versions of
-- Travel Map, private accounts, seasonal feeds, film filters, and Journey Mode.

alter table public.profiles
  add column if not exists is_private boolean not null default false;

alter table public.posts
  add column if not exists location_name text,
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists season text,
  add column if not exists filter_type text;

create table if not exists public.journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  cover_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.journey_posts (
  journey_id uuid not null references public.journeys(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (journey_id, post_id)
);

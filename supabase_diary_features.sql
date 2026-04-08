-- Diary feature schema notes.
-- Run these in Supabase SQL editor before enabling strict DB-backed versions of
-- Travel Map, private accounts, seasonal feeds, film filters, and Journey Mode.

alter table public.profiles
  add column if not exists is_private boolean not null default false;

alter table public.posts
  add column if not exists location_name text,
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists journey_title text,
  add column if not exists season text,
  add column if not exists filter_type text,
  add column if not exists report_count integer not null default 0,
  add column if not exists is_hidden boolean not null default false;

create table if not exists public.story_views (
  post_id uuid not null references public.posts(id) on delete cascade,
  viewer_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, viewer_id)
);

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

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null default 'post',
  target_id uuid not null,
  reason text not null,
  description text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

alter table public.reports
  add column if not exists reporter_id uuid references auth.users(id) on delete cascade,
  add column if not exists target_type text not null default 'post',
  add column if not exists target_id uuid,
  add column if not exists reason text,
  add column if not exists description text,
  add column if not exists status text not null default 'pending',
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists reports_unique_reporter_target
  on public.reports (reporter_id, target_type, target_id);

create table if not exists public.report_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  admin_id uuid not null references auth.users(id) on delete cascade,
  action_taken text not null,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;
alter table public.report_actions enable row level security;

drop policy if exists "Authenticated users can create reports" on public.reports;
create policy "Authenticated users can create reports"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- Reading and resolving reports should be restricted to admins.
-- If your profiles table has an is_admin boolean, these policies will work.
alter table public.profiles add column if not exists is_admin boolean not null default false;

drop policy if exists "Admins can read reports" on public.reports;
create policy "Admins can read reports"
  on public.reports for select
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

drop policy if exists "Admins can update reports" on public.reports;
create policy "Admins can update reports"
  on public.reports for update
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

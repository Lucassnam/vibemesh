-- Profile settings support for Vibemesh / Blueprint.
-- Run this in Supabase if your project was created before profile settings existed.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

create unique index if not exists profiles_username_unique
  on public.profiles (lower(username));

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by everyone" on public.profiles;
create policy "Profiles are readable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their profile" on public.profiles;
create policy "Users can insert their profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Avatar images are public" on storage.objects;
create policy "Avatar images are public"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their avatar" on storage.objects;
create policy "Users can upload their avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can update their avatar" on storage.objects;
create policy "Users can update their avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

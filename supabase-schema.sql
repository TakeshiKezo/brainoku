-- Brainoku Sudoku — Supabase Schema
-- In Supabase: SQL Editor → New Query → einfügen → Run

-- ============================================================
-- 1. Profile-Tabelle (1:1 mit auth.users)
-- ============================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- 2. Spielstand pro User (Cloud-Sync)
-- ============================================================
create table if not exists public.user_state (
  user_id    uuid primary key references auth.users on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 3. Row Level Security
-- ============================================================
alter table public.profiles   enable row level security;
alter table public.user_state enable row level security;

drop policy if exists "profiles_select_self"  on public.profiles;
drop policy if exists "profiles_insert_self"  on public.profiles;
drop policy if exists "profiles_update_self"  on public.profiles;
drop policy if exists "user_state_select_self" on public.user_state;
drop policy if exists "user_state_upsert_self" on public.user_state;

create policy "profiles_select_self"   on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_self"   on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_self"   on public.profiles
  for update using (auth.uid() = id);

create policy "user_state_select_self" on public.user_state
  for select using (auth.uid() = user_id);
create policy "user_state_upsert_self" on public.user_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 4. Trigger: bei Signup automatisch Profil anlegen
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 5. updated_at Auto-Update
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists user_state_touch on public.user_state;
create trigger user_state_touch
  before update on public.user_state
  for each row execute function public.touch_updated_at();

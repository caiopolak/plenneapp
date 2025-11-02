-- Ensure required extension for gen_random_uuid
create extension if not exists pgcrypto;

-- Create user_themes table if it doesn't exist
create table if not exists public.user_themes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  theme_name text not null,
  custom_colors jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Basic indexes
create index if not exists idx_user_themes_user_id on public.user_themes(user_id);
create index if not exists idx_user_themes_is_active on public.user_themes(is_active);

-- Enforce at most one active theme per user
create unique index if not exists ux_user_themes_user_active on public.user_themes(user_id) where is_active = true;

-- Enable RLS
alter table public.user_themes enable row level security;

-- Recreate policies idempotently
drop policy if exists "Users can view their own themes" on public.user_themes;
create policy "Users can view their own themes"
  on public.user_themes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own themes" on public.user_themes;
create policy "Users can insert their own themes"
  on public.user_themes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own themes" on public.user_themes;
create policy "Users can update their own themes"
  on public.user_themes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own themes" on public.user_themes;
create policy "Users can delete their own themes"
  on public.user_themes for delete
  using (auth.uid() = user_id);

-- Function to auto-update updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

-- Trigger for updated_at (drop/create to avoid duplicates)
drop trigger if exists user_themes_set_updated_at on public.user_themes;
create trigger user_themes_set_updated_at
before update on public.user_themes
for each row execute function public.update_updated_at_column();
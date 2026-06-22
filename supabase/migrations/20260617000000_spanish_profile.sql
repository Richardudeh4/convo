-- Rename chinese_level → spanish_level and add rank column
alter table public.profiles
  rename column chinese_level to spanish_level;

alter table public.profiles
  add column if not exists rank integer not null default 0;

-- Allow updating the new columns
grant update (spanish_level, rank) on table public.profiles to authenticated;
grant insert (spanish_level) on table public.profiles to authenticated;

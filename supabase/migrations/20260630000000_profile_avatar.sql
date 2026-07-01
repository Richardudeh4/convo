-- Profile avatar URL + storage bucket for user-uploaded photos

alter table public.profiles
  add column if not exists avatar_url text;

grant update (avatar_url) on table public.profiles to authenticated;
grant insert (avatar_url) on table public.profiles to authenticated;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

create policy "Avatar images are publicly accessible"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (string_to_array(name, '/'))[1]
);

create policy "Users can update their own avatar"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (string_to_array(name, '/'))[1]
);

create policy "Users can delete their own avatar"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (string_to_array(name, '/'))[1]
);

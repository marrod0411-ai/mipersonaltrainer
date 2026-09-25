create or replace function public.is_challenge_participant(_user_id uuid, _quarter text)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.challenge_participants where user_id = _user_id and quarter = _quarter) $$;

drop policy if exists "likes read" on public.likes;
create policy "likes read" on public.likes for select to authenticated
using (auth.uid() = user_id or exists (select 1 from public.posts p where p.id = likes.post_id));

drop policy if exists "comments read" on public.comments;
create policy "comments read" on public.comments for select to authenticated
using (auth.uid() = user_id or exists (select 1 from public.posts p where p.id = comments.post_id));

drop policy if exists "awards read" on public.awards;
create policy "awards read" on public.awards for select to authenticated
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin') or announcement <> '' or place between 1 and 3);

drop policy if exists "cp read" on public.challenge_participants;
create policy "cp read" on public.challenge_participants for select to authenticated
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin') or public.is_challenge_participant(auth.uid(), quarter));

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated
using (
  auth.uid() = id
  or public.has_role(auth.uid(), 'admin')
  or exists (select 1 from public.posts p where p.user_id = profiles.id)
  or exists (select 1 from public.comments c where c.user_id = profiles.id)
  or exists (select 1 from public.awards a where a.user_id = profiles.id)
);

drop policy if exists "community read" on storage.objects;
create policy "community read" on storage.objects for select to authenticated
using (
  bucket_id = 'community' and (
    owner_id = (select auth.uid()::text)
    or public.has_role(auth.uid(), 'admin')
    or exists (select 1 from public.posts p where p.photo_url = objects.name and p.visibility = 'todos' and p.hidden = false)
  )
);
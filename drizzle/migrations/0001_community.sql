create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create table public.profiles (
  id uuid primary key,
  display_name text not null default 'Atleta',
  country text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles read" on public.profiles for select to authenticated using (true);
create policy "profiles insert own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update to authenticated using (auth.uid() = id);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  kind text not null default 'progreso',
  body text not null default '',
  photo_url text,
  plan_week int,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "posts read" on public.posts for select to authenticated using (true);
create policy "posts insert own" on public.posts for insert to authenticated with check (auth.uid() = user_id);
create policy "posts delete own or admin" on public.posts for delete to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  body text not null,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.comments to authenticated;
grant all on public.comments to service_role;
alter table public.comments enable row level security;
create policy "comments read" on public.comments for select to authenticated using (true);
create policy "comments insert own" on public.comments for insert to authenticated with check (auth.uid() = user_id);
create policy "comments delete own or admin" on public.comments for delete to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create table public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  primary key (post_id, user_id)
);
grant select, insert, delete on public.likes to authenticated;
grant all on public.likes to service_role;
alter table public.likes enable row level security;
create policy "likes read" on public.likes for select to authenticated using (true);
create policy "likes insert own" on public.likes for insert to authenticated with check (auth.uid() = user_id);
create policy "likes delete own" on public.likes for delete to authenticated using (auth.uid() = user_id);

create table public.awards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  quarter text not null,
  title text not null default 'Atleta del trimestre',
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.awards to authenticated;
grant all on public.awards to service_role;
alter table public.awards enable row level security;
create policy "awards read" on public.awards for select to authenticated using (true);
create policy "awards admin insert" on public.awards for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "awards admin delete" on public.awards for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.community_leaderboard(_from timestamptz, _to timestamptz)
returns table (user_id uuid, display_name text, country text, posts int, comments int, likes int, sessions int, score int)
language sql stable security definer set search_path = public
as $$
  with p as (select user_id, count(*)::int n from posts where created_at >= _from and created_at < _to group by user_id),
  c as (select user_id, count(*)::int n from comments where created_at >= _from and created_at < _to group by user_id),
  l as (select po.user_id, count(*)::int n from likes li join posts po on po.id = li.post_id where po.created_at >= _from and po.created_at < _to group by po.user_id),
  s as (select user_id, case when jsonb_typeof(log->'completedSessions') = 'array' then jsonb_array_length(log->'completedSessions') else 0 end::int n from user_data)
  select pr.id, pr.display_name, pr.country,
    coalesce(p.n,0), coalesce(c.n,0), coalesce(l.n,0), coalesce(s.n,0),
    (coalesce(p.n,0)*5 + coalesce(c.n,0)*2 + coalesce(l.n,0) + coalesce(s.n,0)*3)::int
  from profiles pr
  left join p on p.user_id = pr.id left join c on c.user_id = pr.id
  left join l on l.user_id = pr.id left join s on s.user_id = pr.id
  where auth.uid() is not null and (coalesce(p.n,0) + coalesce(c.n,0)) > 0
  order by 8 desc limit 20
$$;
grant execute on function public.community_leaderboard(timestamptz, timestamptz) to authenticated;

create policy "community upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'community' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "community delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'community' and (storage.foldername(name))[1] = auth.uid()::text);
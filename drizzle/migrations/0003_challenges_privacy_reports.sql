ALTER TABLE public.posts ADD COLUMN visibility text NOT NULL DEFAULT 'todos';
ALTER TABLE public.posts ADD COLUMN hidden boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.validate_post_visibility() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.visibility NOT IN ('todos','jurado','solo_yo') THEN RAISE EXCEPTION 'visibilidad inválida'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER posts_visibility_check BEFORE INSERT OR UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.validate_post_visibility();

DROP POLICY IF EXISTS "posts read" ON public.posts;
CREATE POLICY "posts read" ON public.posts FOR SELECT TO authenticated USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
  OR (visibility = 'todos' AND hidden = false)
);
CREATE POLICY "posts update own or admin" ON public.posts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
GRANT UPDATE ON public.posts TO authenticated;

-- Photos: readable only when the viewer may see the post that uses them
DROP POLICY IF EXISTS "community read" ON storage.objects;
CREATE POLICY "community read" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'community' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.posts p WHERE p.photo_url = storage.objects.name AND p.visibility = 'todos' AND p.hidden = false)
  )
);

-- Reports
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL DEFAULT auth.uid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports insert own" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports read own or admin" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "reports admin update" ON public.reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "reports admin delete" ON public.reports FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Quarterly challenge participants
CREATE TABLE public.challenge_participants (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  quarter text NOT NULL,
  goal text NOT NULL DEFAULT '',
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, quarter)
);
GRANT SELECT, INSERT, DELETE ON public.challenge_participants TO authenticated;
GRANT ALL ON public.challenge_participants TO service_role;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cp read" ON public.challenge_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "cp join own" ON public.challenge_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cp leave own" ON public.challenge_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Awards: place + public announcement
ALTER TABLE public.awards ADD COLUMN place integer NOT NULL DEFAULT 1;
ALTER TABLE public.awards ADD COLUMN announcement text NOT NULL DEFAULT '';

-- Transparent challenge ranking
CREATE OR REPLACE FUNCTION public.challenge_leaderboard(_quarter text, _from timestamptz, _to timestamptz)
RETURNS TABLE(user_id uuid, display_name text, country text, posts integer, comments integer, likes integer, sessions integer, progress_photos integer, has_start boolean, has_end boolean, score integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  with part as (select cp.user_id from challenge_participants cp where cp.quarter = _quarter),
  p as (select user_id, count(*)::int n from posts where created_at >= _from and created_at < _to and hidden = false group by user_id),
  ph as (select user_id, count(*)::int n,
           bool_or(kind = 'inicio') s, bool_or(kind in ('progreso','logro')) e
         from posts where photo_url is not null and created_at >= _from and created_at < _to and hidden = false group by user_id),
  c as (select user_id, count(*)::int n from comments where created_at >= _from and created_at < _to group by user_id),
  l as (select po.user_id, count(*)::int n from likes li join posts po on po.id = li.post_id where po.created_at >= _from and po.created_at < _to group by po.user_id),
  s as (select ud.user_id, count(*)::int n from user_data ud,
          lateral jsonb_array_elements_text(case when jsonb_typeof(ud.log->'completedSessions') = 'array' then ud.log->'completedSessions' else '[]'::jsonb end) x
        where left(x, 10) >= to_char(_from, 'YYYY-MM-DD') and left(x, 10) < to_char(_to, 'YYYY-MM-DD')
        group by ud.user_id)
  select pr.id, pr.display_name, pr.country,
    coalesce(p.n,0), coalesce(c.n,0), coalesce(l.n,0), coalesce(s.n,0), coalesce(ph.n,0),
    coalesce(ph.s,false), coalesce(ph.e,false),
    (least(coalesce(s.n,0),60)*3 + least(coalesce(p.n,0),30)*5 + least(coalesce(c.n,0),50)*2 + least(coalesce(l.n,0),100)
      + case when coalesce(ph.s,false) and coalesce(ph.e,false) then 30 else 0 end)::int
  from part join profiles pr on pr.id = part.user_id
  left join p on p.user_id = pr.id left join c on c.user_id = pr.id
  left join l on l.user_id = pr.id left join s on s.user_id = pr.id left join ph on ph.user_id = pr.id
  where auth.uid() is not null
  order by 11 desc limit 50
$$;
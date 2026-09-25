CREATE TABLE public.trainers (
  user_id uuid PRIMARY KEY DEFAULT auth.uid(),
  display_name text NOT NULL DEFAULT 'Entrenador',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.trainers TO authenticated;
GRANT ALL ON public.trainers TO service_role;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trainers own read" ON public.trainers FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "trainers own insert" ON public.trainers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trainers own update" ON public.trainers FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.trainer_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL DEFAULT auth.uid(),
  profile jsonb NOT NULL,
  plan jsonb,
  week integer NOT NULL DEFAULT 1,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX trainer_students_trainer_idx ON public.trainer_students(trainer_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trainer_students TO authenticated;
GRANT ALL ON public.trainer_students TO service_role;
ALTER TABLE public.trainer_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "students trainer all" ON public.trainer_students FOR ALL TO authenticated
  USING (auth.uid() = trainer_id AND EXISTS (SELECT 1 FROM public.trainers t WHERE t.user_id = auth.uid()))
  WITH CHECK (auth.uid() = trainer_id AND EXISTS (SELECT 1 FROM public.trainers t WHERE t.user_id = auth.uid()));
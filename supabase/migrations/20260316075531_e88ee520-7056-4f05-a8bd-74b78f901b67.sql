
CREATE TABLE public.lesson_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL,
  subject TEXT NOT NULL,
  student_level TEXT NOT NULL,
  duration TEXT NOT NULL,
  num_students TEXT NOT NULL,
  learning_goals TEXT,
  weak_points TEXT,
  language TEXT NOT NULL DEFAULT 'ka',
  plan_content TEXT NOT NULL,
  plan_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can insert own plans" ON public.lesson_plans
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Tutors can read own plans" ON public.lesson_plans
  FOR SELECT TO authenticated
  USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can delete own plans" ON public.lesson_plans
  FOR DELETE TO authenticated
  USING (auth.uid() = tutor_id);

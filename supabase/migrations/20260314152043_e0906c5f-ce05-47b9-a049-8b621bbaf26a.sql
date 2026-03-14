
CREATE TABLE public.tutor_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  experience TEXT NOT NULL,
  education TEXT,
  certifications TEXT,
  bio TEXT NOT NULL,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  hourly_rate NUMERIC(10,2) NOT NULL,
  native_language TEXT,
  other_languages TEXT,
  availability TEXT NOT NULL,
  timezone TEXT,
  about_teaching TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
);

ALTER TABLE public.tutor_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts on tutor_applications"
  ON public.tutor_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

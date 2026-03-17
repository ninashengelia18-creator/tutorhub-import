-- Create a public-facing tutor directory table with only safe fields
CREATE TABLE IF NOT EXISTS public.public_tutor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid UNIQUE,
  source text NOT NULL DEFAULT 'application',
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  primary_subject text NOT NULL,
  subjects text[] NOT NULL DEFAULT '{}',
  experience text NOT NULL,
  hourly_rate numeric NOT NULL,
  country text,
  native_language text,
  other_languages text,
  languages_spoken text[] NOT NULL DEFAULT '{}',
  bio text NOT NULL,
  education text,
  certifications text,
  avatar_url text,
  rating numeric NOT NULL DEFAULT 5.0,
  review_count integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT public_tutor_profiles_application_id_fkey
    FOREIGN KEY (application_id) REFERENCES public.tutor_applications(id) ON DELETE SET NULL,
  CONSTRAINT public_tutor_profiles_source_check CHECK (source IN ('application','manual')),
  CONSTRAINT public_tutor_profiles_rating_check CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT public_tutor_profiles_review_count_check CHECK (review_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_public_tutor_profiles_published
  ON public.public_tutor_profiles (is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_public_tutor_profiles_subjects
  ON public.public_tutor_profiles USING gin (subjects);

ALTER TABLE public.public_tutor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published tutor profiles"
ON public.public_tutor_profiles
FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Admins can manage tutor profiles"
ON public.public_tutor_profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_public_tutor_profiles_updated_at
BEFORE UPDATE ON public.public_tutor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.sync_public_tutor_profile_from_application(_application_id uuid)
RETURNS public.public_tutor_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _application public.tutor_applications;
  _profile public.public_tutor_profiles;
  _languages text[];
BEGIN
  SELECT *
  INTO _application
  FROM public.tutor_applications
  WHERE id = _application_id;

  IF _application.id IS NULL THEN
    RAISE EXCEPTION 'Tutor application not found';
  END IF;

  _languages := array_remove(ARRAY[
    NULLIF(BTRIM(_application.native_language), ''),
    NULLIF(BTRIM(_application.other_languages), '')
  ], NULL);

  INSERT INTO public.public_tutor_profiles (
    application_id,
    source,
    first_name,
    last_name,
    email,
    primary_subject,
    subjects,
    experience,
    hourly_rate,
    country,
    native_language,
    other_languages,
    languages_spoken,
    bio,
    education,
    certifications,
    is_published
  )
  VALUES (
    _application.id,
    'application',
    _application.first_name,
    _application.last_name,
    _application.email,
    COALESCE(_application.subjects[1], 'General'),
    COALESCE(_application.subjects, '{}'),
    _application.experience,
    _application.hourly_rate,
    _application.country,
    _application.native_language,
    _application.other_languages,
    COALESCE(_languages, '{}'),
    _application.bio,
    _application.education,
    _application.certifications,
    (_application.status = 'approved')
  )
  ON CONFLICT (application_id)
  DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    primary_subject = EXCLUDED.primary_subject,
    subjects = EXCLUDED.subjects,
    experience = EXCLUDED.experience,
    hourly_rate = EXCLUDED.hourly_rate,
    country = EXCLUDED.country,
    native_language = EXCLUDED.native_language,
    other_languages = EXCLUDED.other_languages,
    languages_spoken = EXCLUDED.languages_spoken,
    bio = EXCLUDED.bio,
    education = EXCLUDED.education,
    certifications = EXCLUDED.certifications,
    is_published = EXCLUDED.is_published,
    updated_at = now()
  RETURNING * INTO _profile;

  RETURN _profile;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_tutor_application(_application_id uuid)
RETURNS public.tutor_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _application public.tutor_applications;
  _auth_user_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.tutor_applications
  SET status = 'approved'
  WHERE id = _application_id
  RETURNING * INTO _application;

  IF _application.id IS NULL THEN
    RAISE EXCEPTION 'Tutor application not found';
  END IF;

  PERFORM public.sync_public_tutor_profile_from_application(_application.id);

  SELECT id
  INTO _auth_user_id
  FROM auth.users
  WHERE lower(email) = lower(_application.email)
  LIMIT 1;

  IF _auth_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_auth_user_id, 'tutor'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN _application;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_tutor_application(_application_id uuid)
RETURNS public.tutor_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _application public.tutor_applications;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.tutor_applications
  SET status = 'rejected'
  WHERE id = _application_id
  RETURNING * INTO _application;

  IF _application.id IS NULL THEN
    RAISE EXCEPTION 'Tutor application not found';
  END IF;

  UPDATE public.public_tutor_profiles
  SET is_published = false,
      updated_at = now()
  WHERE application_id = _application.id;

  RETURN _application;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_tutor_profile(
  _first_name text,
  _last_name text,
  _email text,
  _primary_subject text,
  _subjects text[],
  _experience text,
  _hourly_rate numeric,
  _country text DEFAULT NULL,
  _native_language text DEFAULT NULL,
  _other_languages text DEFAULT NULL,
  _bio text DEFAULT NULL,
  _education text DEFAULT NULL,
  _certifications text DEFAULT NULL,
  _avatar_url text DEFAULT NULL,
  _rating numeric DEFAULT 5.0,
  _review_count integer DEFAULT 0
)
RETURNS public.public_tutor_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile public.public_tutor_profiles;
  _languages text[];
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  _languages := array_remove(ARRAY[
    NULLIF(BTRIM(_native_language), ''),
    NULLIF(BTRIM(_other_languages), '')
  ], NULL);

  INSERT INTO public.public_tutor_profiles (
    source,
    first_name,
    last_name,
    email,
    primary_subject,
    subjects,
    experience,
    hourly_rate,
    country,
    native_language,
    other_languages,
    languages_spoken,
    bio,
    education,
    certifications,
    avatar_url,
    rating,
    review_count,
    is_published
  )
  VALUES (
    'manual',
    NULLIF(BTRIM(_first_name), ''),
    NULLIF(BTRIM(_last_name), ''),
    NULLIF(BTRIM(_email), ''),
    COALESCE(NULLIF(BTRIM(_primary_subject), ''), 'General'),
    COALESCE(_subjects, ARRAY[]::text[]),
    COALESCE(NULLIF(BTRIM(_experience), ''), 'New tutor'),
    _hourly_rate,
    NULLIF(BTRIM(_country), ''),
    NULLIF(BTRIM(_native_language), ''),
    NULLIF(BTRIM(_other_languages), ''),
    COALESCE(_languages, ARRAY[]::text[]),
    COALESCE(NULLIF(BTRIM(_bio), ''), 'Professional tutor available on LearnEazy.'),
    NULLIF(BTRIM(_education), ''),
    NULLIF(BTRIM(_certifications), ''),
    NULLIF(BTRIM(_avatar_url), ''),
    COALESCE(_rating, 5.0),
    COALESCE(_review_count, 0),
    true
  )
  RETURNING * INTO _profile;

  RETURN _profile;
END;
$$;
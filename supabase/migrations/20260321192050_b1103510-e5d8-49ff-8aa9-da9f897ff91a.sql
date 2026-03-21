
CREATE OR REPLACE FUNCTION public.save_my_tutor_profile(
  _bio text,
  _experience text,
  _hourly_rate numeric,
  _country text DEFAULT NULL,
  _native_language text DEFAULT NULL,
  _other_languages text DEFAULT NULL,
  _education text DEFAULT NULL,
  _certifications text DEFAULT NULL,
  _avatar_url text DEFAULT NULL,
  _subjects text[] DEFAULT NULL,
  _phone text DEFAULT NULL,
  _timezone text DEFAULT NULL,
  _availability text DEFAULT NULL,
  _about_teaching text DEFAULT NULL
)
RETURNS SETOF public.public_tutor_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _profile public.public_tutor_profiles;
BEGIN
  -- Get the email of the current user
  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();
  IF _email IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Update public_tutor_profiles
  UPDATE public.public_tutor_profiles
  SET
    bio = _bio,
    experience = _experience,
    hourly_rate = _hourly_rate,
    country = COALESCE(_country, country),
    native_language = COALESCE(_native_language, native_language),
    other_languages = COALESCE(_other_languages, other_languages),
    education = COALESCE(_education, education),
    certifications = COALESCE(_certifications, certifications),
    avatar_url = COALESCE(_avatar_url, avatar_url),
    subjects = COALESCE(_subjects, subjects),
    primary_subject = COALESCE(_subjects[1], primary_subject),
    updated_at = now()
  WHERE email = _email
  RETURNING * INTO _profile;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tutor profile not found for current user';
  END IF;

  -- Also update tutor_applications with the extra fields
  UPDATE public.tutor_applications
  SET
    phone = COALESCE(_phone, phone),
    timezone = COALESCE(_timezone, timezone),
    availability = COALESCE(_availability, availability),
    about_teaching = COALESCE(_about_teaching, about_teaching),
    bio = _bio,
    experience = _experience,
    hourly_rate = _hourly_rate,
    country = COALESCE(_country, country),
    native_language = COALESCE(_native_language, native_language),
    other_languages = COALESCE(_other_languages, other_languages),
    education = COALESCE(_education, education),
    certifications = COALESCE(_certifications, certifications),
    subjects = COALESCE(_subjects, subjects)
  WHERE email = _email;

  RETURN NEXT _profile;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_public_tutor_profile_from_application(_application_id uuid)
RETURNS public.public_tutor_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _application public.tutor_applications;
  _profile public.public_tutor_profiles;
  _auth_user_id uuid;
  _avatar_url text;
  _languages text[];
BEGIN
  SELECT *
  INTO _application
  FROM public.tutor_applications
  WHERE id = _application_id;

  IF _application.id IS NULL THEN
    RAISE EXCEPTION 'Tutor application not found';
  END IF;

  SELECT id
  INTO _auth_user_id
  FROM auth.users
  WHERE lower(email) = lower(_application.email)
  LIMIT 1;

  IF _auth_user_id IS NOT NULL THEN
    SELECT avatar_url
    INTO _avatar_url
    FROM public.profiles
    WHERE id = _auth_user_id;
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
    avatar_url,
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
    _avatar_url,
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
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.public_tutor_profiles.avatar_url),
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

  SELECT id
  INTO _auth_user_id
  FROM auth.users
  WHERE lower(email) = lower(_application.email)
  LIMIT 1;

  IF _auth_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET display_name = COALESCE(NULLIF(display_name, ''), CONCAT_WS(' ', _application.first_name, _application.last_name)),
        hourly_rate = COALESCE(hourly_rate, _application.hourly_rate),
        updated_at = now()
    WHERE id = _auth_user_id;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (_auth_user_id, 'tutor'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  PERFORM public.sync_public_tutor_profile_from_application(_application.id);

  RETURN _application;
END;
$$;
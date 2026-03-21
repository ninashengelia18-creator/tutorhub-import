
-- Function: ensure_my_partner_profile
CREATE OR REPLACE FUNCTION public.ensure_my_partner_profile()
RETURNS public.public_partner_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _auth_email text;
  _auth_display_name text;
  _first_name text;
  _last_name text;
  _profile public.profiles;
  _application public.conversation_partner_applications;
  _existing public.public_partner_profiles;
  _result public.public_partner_profiles;
  _languages text[];
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF NOT public.has_role(_user_id, 'convo_partner') AND NOT public.has_role(_user_id, 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT u.email,
    COALESCE(NULLIF(BTRIM(p.display_name), ''), split_part(u.email, '@', 1))
  INTO _auth_email, _auth_display_name
  FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = _user_id;

  IF _auth_email IS NULL THEN RAISE EXCEPTION 'Account email not found'; END IF;

  SELECT * INTO _profile FROM public.profiles WHERE id = _user_id;

  SELECT * INTO _application
  FROM public.conversation_partner_applications
  WHERE lower(email) = lower(_auth_email)
  ORDER BY created_at DESC LIMIT 1;

  SELECT * INTO _existing
  FROM public.public_partner_profiles
  WHERE lower(COALESCE(email, '')) = lower(_auth_email)
  ORDER BY created_at DESC LIMIT 1;

  IF _existing.id IS NULL AND _application.id IS NOT NULL THEN
    SELECT * INTO _existing FROM public.public_partner_profiles
    WHERE application_id = _application.id LIMIT 1;
  END IF;

  _first_name := COALESCE(NULLIF(split_part(_auth_display_name, ' ', 1), ''), _application.first_name, 'Partner');
  _last_name := COALESCE(NULLIF(BTRIM(regexp_replace(_auth_display_name, '^\S+\s*', '')), ''), _application.last_name, '');

  _languages := array_remove(ARRAY[
    NULLIF(BTRIM(_application.country), ''),
    NULLIF(BTRIM(_application.conversation_style), '')
  ], NULL);

  IF _existing.id IS NULL THEN
    INSERT INTO public.public_partner_profiles (
      application_id, source, first_name, last_name, email,
      native_language, country, bio, avatar_url, timezone, is_published
    ) VALUES (
      _application.id,
      CASE WHEN _application.id IS NULL THEN 'manual' ELSE 'application' END,
      _first_name, _last_name, _auth_email,
      NULLIF(BTRIM(_application.country), ''),
      NULLIF(BTRIM(_application.country), ''),
      COALESCE(NULLIF(BTRIM(_application.motivation), ''), 'Friendly conversation partner on LearnEazy.'),
      _profile.avatar_url,
      NULLIF(BTRIM(_application.timezone), ''),
      true
    ) RETURNING * INTO _result;
  ELSE
    UPDATE public.public_partner_profiles SET
      application_id = COALESCE(public_partner_profiles.application_id, _application.id),
      email = COALESCE(NULLIF(BTRIM(public_partner_profiles.email), ''), _auth_email),
      first_name = COALESCE(NULLIF(BTRIM(public_partner_profiles.first_name), ''), _first_name),
      last_name = COALESCE(NULLIF(BTRIM(public_partner_profiles.last_name), ''), _last_name),
      avatar_url = COALESCE(_profile.avatar_url, public_partner_profiles.avatar_url),
      is_published = true,
      updated_at = now()
    WHERE id = _existing.id
    RETURNING * INTO _result;
  END IF;

  RETURN _result;
END;
$$;

-- Function: save_my_partner_profile
CREATE OR REPLACE FUNCTION public.save_my_partner_profile(
  _bio text,
  _price_per_session numeric,
  _country text DEFAULT NULL,
  _native_language text DEFAULT NULL,
  _other_languages text DEFAULT NULL,
  _avatar_url text DEFAULT NULL,
  _topics text[] DEFAULT NULL,
  _timezone text DEFAULT NULL,
  _availability text DEFAULT NULL,
  _video_intro_url text DEFAULT NULL
)
RETURNS SETOF public.public_partner_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _email text;
  _profile public.public_partner_profiles;
BEGIN
  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();
  IF _email IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  -- Ensure profile exists
  PERFORM public.ensure_my_partner_profile();

  UPDATE public.public_partner_profiles SET
    bio = _bio,
    price_per_session = GREATEST(COALESCE(_price_per_session, price_per_session, 0), 0),
    country = COALESCE(_country, country),
    native_language = COALESCE(_native_language, native_language),
    other_languages = COALESCE(_other_languages, other_languages),
    languages_spoken = array_remove(ARRAY[
      NULLIF(BTRIM(_native_language), ''),
      NULLIF(BTRIM(_other_languages), '')
    ], NULL),
    avatar_url = COALESCE(NULLIF(BTRIM(_avatar_url), ''), avatar_url),
    topics = COALESCE(_topics, topics),
    timezone = COALESCE(_timezone, timezone),
    availability = COALESCE(_availability, availability),
    video_intro_url = COALESCE(_video_intro_url, video_intro_url),
    updated_at = now()
  WHERE email = _email
  RETURNING * INTO _profile;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Partner profile not found for current user';
  END IF;

  -- Also update the application record
  UPDATE public.conversation_partner_applications SET
    timezone = COALESCE(_timezone, timezone),
    conversation_style = COALESCE(_availability, conversation_style),
    country = COALESCE(_country, country)
  WHERE email = _email;

  -- Update profiles table
  UPDATE public.profiles SET
    avatar_url = COALESCE(NULLIF(BTRIM(_avatar_url), ''), avatar_url),
    updated_at = now()
  WHERE id = auth.uid();

  RETURN NEXT _profile;
END;
$$;

-- Function: approve_partner_application
CREATE OR REPLACE FUNCTION public.approve_partner_application(_application_id uuid)
RETURNS public.conversation_partner_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _application public.conversation_partner_applications;
  _auth_user_id uuid;
  _avatar_url text;
  _languages text[];
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.conversation_partner_applications
  SET status = 'approved', updated_at = now()
  WHERE id = _application_id
  RETURNING * INTO _application;

  IF _application.id IS NULL THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  SELECT id INTO _auth_user_id
  FROM auth.users WHERE lower(email) = lower(_application.email) LIMIT 1;

  IF _auth_user_id IS NOT NULL THEN
    UPDATE public.profiles SET
      display_name = COALESCE(NULLIF(display_name, ''), CONCAT_WS(' ', _application.first_name, _application.last_name)),
      updated_at = now()
    WHERE id = _auth_user_id;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (_auth_user_id, 'convo_partner'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    SELECT avatar_url INTO _avatar_url FROM public.profiles WHERE id = _auth_user_id;
  END IF;

  _languages := array_remove(ARRAY[
    NULLIF(BTRIM(_application.country), '')
  ], NULL);

  INSERT INTO public.public_partner_profiles (
    application_id, source, first_name, last_name, email,
    country, bio, avatar_url, timezone, video_intro_url, is_published
  ) VALUES (
    _application.id, 'application',
    _application.first_name, _application.last_name, _application.email,
    _application.country,
    COALESCE(NULLIF(BTRIM(_application.motivation), ''), 'Friendly conversation partner on LearnEazy.'),
    _avatar_url,
    _application.timezone,
    _application.video_intro_url,
    true
  )
  ON CONFLICT (application_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    country = EXCLUDED.country,
    bio = EXCLUDED.bio,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public_partner_profiles.avatar_url),
    timezone = EXCLUDED.timezone,
    video_intro_url = EXCLUDED.video_intro_url,
    is_published = true,
    updated_at = now();

  RETURN _application;
END;
$$;

-- Function: reject_partner_application
CREATE OR REPLACE FUNCTION public.reject_partner_application(_application_id uuid)
RETURNS public.conversation_partner_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _application public.conversation_partner_applications;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.conversation_partner_applications
  SET status = 'rejected', updated_at = now()
  WHERE id = _application_id
  RETURNING * INTO _application;

  IF _application.id IS NULL THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  UPDATE public.public_partner_profiles
  SET is_published = false, updated_at = now()
  WHERE application_id = _application.id;

  RETURN _application;
END;
$$;

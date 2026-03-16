INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'tutor'::public.app_role
FROM public.tutor_applications ta
JOIN auth.users au ON lower(au.email) = lower(ta.email)
WHERE ta.status = 'approved'
ON CONFLICT (user_id, role) DO NOTHING;

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

  RETURN _application;
END;
$$;
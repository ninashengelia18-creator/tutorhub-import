create or replace function public.ensure_my_tutor_profile()
returns public.public_tutor_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  _user_id uuid := auth.uid();
  _auth_email text;
  _auth_display_name text;
  _first_name text;
  _last_name text;
  _profile public.profiles;
  _application public.tutor_applications;
  _existing public.public_tutor_profiles;
  _result public.public_tutor_profiles;
  _subjects text[];
  _languages text[];
begin
  if _user_id is null then
    raise exception 'Unauthorized';
  end if;

  if not public.has_role(_user_id, 'tutor') and not public.has_role(_user_id, 'admin') then
    raise exception 'Unauthorized';
  end if;

  select
    u.email,
    coalesce(nullif(btrim(u.raw_user_meta_data ->> 'display_name'), ''), nullif(btrim(p.display_name), ''), split_part(u.email, '@', 1))
  into _auth_email, _auth_display_name
  from auth.users u
  left join public.profiles p on p.id = u.id
  where u.id = _user_id;

  if _auth_email is null then
    raise exception 'Account email not found';
  end if;

  select * into _profile
  from public.profiles
  where id = _user_id;

  select * into _application
  from public.tutor_applications
  where lower(email) = lower(_auth_email)
  order by created_at desc
  limit 1;

  select * into _existing
  from public.public_tutor_profiles
  where lower(coalesce(email, '')) = lower(_auth_email)
  order by created_at desc
  limit 1;

  if _existing.id is null and _application.id is not null then
    select * into _existing
    from public.public_tutor_profiles
    where application_id = _application.id
    limit 1;
  end if;

  _first_name := coalesce(nullif(split_part(_auth_display_name, ' ', 1), ''), nullif(_application.first_name, ''), 'Tutor');
  _last_name := coalesce(nullif(btrim(regexp_replace(_auth_display_name, '^\S+\s*', '')), ''), nullif(_application.last_name, ''), '');

  _subjects := case
    when coalesce(array_length(_application.subjects, 1), 0) > 0 then _application.subjects
    else array['General']::text[]
  end;

  _languages := array_remove(array[
    nullif(btrim(_application.native_language), ''),
    nullif(btrim(_application.other_languages), '')
  ], null);

  if _existing.id is null then
    insert into public.public_tutor_profiles (
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
    values (
      _application.id,
      case when _application.id is null then 'manual' else 'application' end,
      _first_name,
      _last_name,
      _auth_email,
      coalesce(_subjects[1], 'General'),
      _subjects,
      coalesce(nullif(btrim(_application.experience), ''), 'Professional tutor'),
      coalesce(_profile.hourly_rate, _application.hourly_rate, 0),
      nullif(btrim(_application.country), ''),
      nullif(btrim(_application.native_language), ''),
      nullif(btrim(_application.other_languages), ''),
      coalesce(_languages, array[]::text[]),
      coalesce(nullif(btrim(_application.bio), ''), 'Professional tutor on LearnEazy.'),
      nullif(btrim(_application.education), ''),
      nullif(btrim(_application.certifications), ''),
      _profile.avatar_url,
      true
    )
    returning * into _result;
  else
    update public.public_tutor_profiles
    set
      application_id = coalesce(public.public_tutor_profiles.application_id, _application.id),
      email = coalesce(nullif(btrim(public.public_tutor_profiles.email), ''), _auth_email),
      first_name = coalesce(nullif(btrim(public.public_tutor_profiles.first_name), ''), _first_name),
      last_name = coalesce(nullif(btrim(public.public_tutor_profiles.last_name), ''), _last_name),
      primary_subject = coalesce(nullif(btrim(public.public_tutor_profiles.primary_subject), ''), coalesce(_subjects[1], 'General')),
      subjects = case when coalesce(array_length(public.public_tutor_profiles.subjects, 1), 0) > 0 then public.public_tutor_profiles.subjects else _subjects end,
      experience = coalesce(nullif(btrim(public.public_tutor_profiles.experience), ''), nullif(btrim(_application.experience), ''), 'Professional tutor'),
      hourly_rate = coalesce(public.public_tutor_profiles.hourly_rate, _profile.hourly_rate, _application.hourly_rate, 0),
      country = coalesce(public.public_tutor_profiles.country, nullif(btrim(_application.country), '')),
      native_language = coalesce(public.public_tutor_profiles.native_language, nullif(btrim(_application.native_language), '')),
      other_languages = coalesce(public.public_tutor_profiles.other_languages, nullif(btrim(_application.other_languages), '')),
      languages_spoken = case when coalesce(array_length(public.public_tutor_profiles.languages_spoken, 1), 0) > 0 then public.public_tutor_profiles.languages_spoken else coalesce(_languages, array[]::text[]) end,
      bio = coalesce(nullif(btrim(public.public_tutor_profiles.bio), ''), nullif(btrim(_application.bio), ''), 'Professional tutor on LearnEazy.'),
      education = coalesce(public.public_tutor_profiles.education, nullif(btrim(_application.education), '')),
      certifications = coalesce(public.public_tutor_profiles.certifications, nullif(btrim(_application.certifications), '')),
      avatar_url = coalesce(_profile.avatar_url, public.public_tutor_profiles.avatar_url),
      is_published = true,
      updated_at = now()
    where id = _existing.id
    returning * into _result;
  end if;

  return _result;
end;
$$;

create or replace function public.save_my_tutor_profile(
  _bio text,
  _experience text,
  _hourly_rate numeric,
  _country text default null,
  _native_language text default null,
  _other_languages text default null,
  _education text default null,
  _certifications text default null,
  _avatar_url text default null
)
returns public.public_tutor_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  _user_id uuid := auth.uid();
  _row public.public_tutor_profiles;
  _languages text[];
begin
  if _user_id is null then
    raise exception 'Unauthorized';
  end if;

  select * into _row from public.ensure_my_tutor_profile();

  _languages := array_remove(array[
    nullif(btrim(_native_language), ''),
    nullif(btrim(_other_languages), '')
  ], null);

  update public.public_tutor_profiles
  set
    bio = coalesce(nullif(btrim(_bio), ''), public.public_tutor_profiles.bio, 'Professional tutor on LearnEazy.'),
    experience = coalesce(nullif(btrim(_experience), ''), public.public_tutor_profiles.experience, 'Professional tutor'),
    hourly_rate = greatest(coalesce(_hourly_rate, public.public_tutor_profiles.hourly_rate, 0), 0),
    country = nullif(btrim(_country), ''),
    native_language = nullif(btrim(_native_language), ''),
    other_languages = nullif(btrim(_other_languages), ''),
    languages_spoken = case when coalesce(array_length(_languages, 1), 0) > 0 then _languages else public.public_tutor_profiles.languages_spoken end,
    education = nullif(btrim(_education), ''),
    certifications = nullif(btrim(_certifications), ''),
    avatar_url = coalesce(nullif(btrim(_avatar_url), ''), public.public_tutor_profiles.avatar_url),
    is_published = true,
    updated_at = now()
  where id = _row.id
  returning * into _row;

  update public.profiles
  set
    avatar_url = coalesce(nullif(btrim(_avatar_url), ''), avatar_url),
    hourly_rate = greatest(coalesce(_hourly_rate, hourly_rate, 0), 0),
    updated_at = now()
  where id = _user_id;

  return _row;
end;
$$;
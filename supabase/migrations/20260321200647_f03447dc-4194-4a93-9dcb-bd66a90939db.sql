
-- Link fake tutor profiles to their applications
UPDATE public.public_tutor_profiles p
SET application_id = a.id
FROM public.tutor_applications a
WHERE lower(p.email) = lower(a.email)
AND p.application_id IS NULL
AND p.email LIKE '%example.com';

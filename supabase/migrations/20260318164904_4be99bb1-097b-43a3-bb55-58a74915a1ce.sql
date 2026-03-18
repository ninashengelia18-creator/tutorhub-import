
-- Update the RLS insert policy to allow conversation partner applications (hourly_rate = 0)
DROP POLICY "Allow public inserts on tutor_applications" ON public.tutor_applications;

CREATE POLICY "Allow public inserts on tutor_applications"
ON public.tutor_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (NULLIF(btrim(first_name), '') IS NOT NULL) AND
  (NULLIF(btrim(last_name), '') IS NOT NULL) AND
  (NULLIF(btrim(email), '') IS NOT NULL) AND
  (NULLIF(btrim(experience), '') IS NOT NULL) AND
  (NULLIF(btrim(bio), '') IS NOT NULL) AND
  (COALESCE(array_length(subjects, 1), 0) > 0) AND
  (hourly_rate >= 0) AND
  (NULLIF(btrim(availability), '') IS NOT NULL)
);

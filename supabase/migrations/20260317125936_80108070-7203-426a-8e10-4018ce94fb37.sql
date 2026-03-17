-- Tighten public insert policies to avoid overly permissive RLS expressions
DROP POLICY IF EXISTS "Allow public inserts on tutor_applications" ON public.tutor_applications;
CREATE POLICY "Allow public inserts on tutor_applications"
ON public.tutor_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  NULLIF(BTRIM(first_name), '') IS NOT NULL
  AND NULLIF(BTRIM(last_name), '') IS NOT NULL
  AND NULLIF(BTRIM(email), '') IS NOT NULL
  AND NULLIF(BTRIM(experience), '') IS NOT NULL
  AND NULLIF(BTRIM(bio), '') IS NOT NULL
  AND COALESCE(array_length(subjects, 1), 0) > 0
  AND hourly_rate > 0
  AND NULLIF(BTRIM(availability), '') IS NOT NULL
);

DROP POLICY IF EXISTS "Allow public inserts" ON public.business_inquiries;
CREATE POLICY "Allow public inserts"
ON public.business_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  NULLIF(BTRIM(company_name), '') IS NOT NULL
  AND NULLIF(BTRIM(contact_name), '') IS NOT NULL
  AND NULLIF(BTRIM(email), '') IS NOT NULL
);

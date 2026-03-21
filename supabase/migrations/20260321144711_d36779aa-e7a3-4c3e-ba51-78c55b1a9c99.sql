CREATE POLICY "Authenticated can read tutor meet_link by name"
ON public.profiles
FOR SELECT
TO authenticated
USING (meet_link IS NOT NULL);
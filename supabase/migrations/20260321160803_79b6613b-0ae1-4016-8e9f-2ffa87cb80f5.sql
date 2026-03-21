CREATE POLICY "Service role can insert sent emails"
ON public.sent_emails
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role'::text);
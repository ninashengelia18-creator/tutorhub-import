
CREATE TABLE public.sent_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  body_preview text,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  application_type text NOT NULL
);

ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read sent emails"
  ON public.sent_emails
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

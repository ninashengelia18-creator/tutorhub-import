
CREATE TABLE public.admin_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('tutor', 'partner')),
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'tutor', 'partner')),
  sender_name TEXT NOT NULL DEFAULT 'LearnEazy Admin',
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "admin_full_access" ON public.admin_messages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tutors can read messages addressed to them
CREATE POLICY "tutor_read_own" ON public.admin_messages
  FOR SELECT TO authenticated
  USING (
    recipient_type = 'tutor'
    AND recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Tutors can insert replies (sender_type = 'tutor')
CREATE POLICY "tutor_reply" ON public.admin_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_type = 'tutor'
    AND recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Partners can read messages addressed to them
CREATE POLICY "partner_read_own" ON public.admin_messages
  FOR SELECT TO authenticated
  USING (
    recipient_type = 'partner'
    AND recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Partners can insert replies (sender_type = 'partner')
CREATE POLICY "partner_reply" ON public.admin_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_type = 'partner'
    AND recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Enable realtime for admin_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_messages;

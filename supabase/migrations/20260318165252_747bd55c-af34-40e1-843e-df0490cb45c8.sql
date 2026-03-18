
-- Create separate table for conversation partner applications
CREATE TABLE public.conversation_partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  country text,
  motivation text NOT NULL,
  conversation_style text,
  video_intro_url text,
  id_document_url text,
  agreed_to_terms boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE public.conversation_partner_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can insert an application
CREATE POLICY "Allow public inserts on conversation_partner_applications"
ON public.conversation_partner_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (NULLIF(btrim(first_name), '') IS NOT NULL) AND
  (NULLIF(btrim(last_name), '') IS NOT NULL) AND
  (NULLIF(btrim(email), '') IS NOT NULL) AND
  (NULLIF(btrim(motivation), '') IS NOT NULL) AND
  (agreed_to_terms = true)
);

-- Only admins can read all applications
CREATE POLICY "Admins can read conversation partner applications"
ON public.conversation_partner_applications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update applications
CREATE POLICY "Admins can update conversation partner applications"
ON public.conversation_partner_applications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.conversation_partner_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

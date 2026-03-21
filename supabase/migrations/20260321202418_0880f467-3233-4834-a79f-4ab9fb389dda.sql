
-- Add convo_partner to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'convo_partner';

-- Create public_partner_profiles table
CREATE TABLE public.public_partner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid UNIQUE REFERENCES public.conversation_partner_applications(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  avatar_url text,
  native_language text,
  other_languages text,
  languages_spoken text[] NOT NULL DEFAULT '{}',
  country text,
  bio text NOT NULL DEFAULT 'Friendly conversation partner on LearnEazy.',
  topics text[] NOT NULL DEFAULT '{}',
  price_per_session numeric NOT NULL DEFAULT 0,
  availability text,
  timezone text,
  video_intro_url text,
  rating numeric NOT NULL DEFAULT 5.0,
  review_count integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'application',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.public_partner_profiles ENABLE ROW LEVEL SECURITY;

-- Public can read published partner profiles
CREATE POLICY "Public can read published partner profiles"
  ON public.public_partner_profiles
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Admins can manage partner profiles
CREATE POLICY "Admins can manage partner profiles"
  ON public.public_partner_profiles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update trigger
CREATE TRIGGER update_partner_profiles_updated_at
  BEFORE UPDATE ON public.public_partner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

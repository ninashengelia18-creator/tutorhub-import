CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  preferred_currency TEXT NOT NULL DEFAULT 'USD',
  preferred_timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_preferences_language_check CHECK (preferred_language IN ('en', 'ka', 'ru')),
  CONSTRAINT user_preferences_currency_check CHECK (preferred_currency IN ('USD', 'GEL', 'EUR'))
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
ON public.user_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON public.user_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON public.user_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
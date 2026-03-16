CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY,
  email_transactional BOOLEAN NOT NULL DEFAULT true,
  email_tips_discount BOOLEAN NOT NULL DEFAULT false,
  email_surveys BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notification_preferences' AND policyname = 'Users can read own notification preferences'
  ) THEN
    CREATE POLICY "Users can read own notification preferences"
    ON public.notification_preferences
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notification_preferences' AND policyname = 'Users can insert own notification preferences'
  ) THEN
    CREATE POLICY "Users can insert own notification preferences"
    ON public.notification_preferences
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notification_preferences' AND policyname = 'Users can update own notification preferences'
  ) THEN
    CREATE POLICY "Users can update own notification preferences"
    ON public.notification_preferences
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  tutor_name TEXT NOT NULL,
  sender_id UUID NOT NULL,
  sender_display_name TEXT,
  sender_type TEXT NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_student_tutor_created_at
ON public.messages (student_id, tutor_name, created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Students can read own messages'
  ) THEN
    CREATE POLICY "Students can read own messages"
    ON public.messages
    FOR SELECT
    TO authenticated
    USING (auth.uid() = student_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Tutors can read own messages'
  ) THEN
    CREATE POLICY "Tutors can read own messages"
    ON public.messages
    FOR SELECT
    TO authenticated
    USING (
      tutor_name = (
        SELECT profiles.display_name
        FROM public.profiles
        WHERE profiles.id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Students can insert own messages'
  ) THEN
    CREATE POLICY "Students can insert own messages"
    ON public.messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = student_id
      AND auth.uid() = sender_id
      AND sender_type = 'student'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Tutors can insert own messages'
  ) THEN
    CREATE POLICY "Tutors can insert own messages"
    ON public.messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = sender_id
      AND sender_type = 'tutor'
      AND tutor_name = (
        SELECT profiles.display_name
        FROM public.profiles
        WHERE profiles.id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Students can update own messages'
  ) THEN
    CREATE POLICY "Students can update own messages"
    ON public.messages
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Tutors can update own messages'
  ) THEN
    CREATE POLICY "Tutors can update own messages"
    ON public.messages
    FOR UPDATE
    TO authenticated
    USING (
      tutor_name = (
        SELECT profiles.display_name
        FROM public.profiles
        WHERE profiles.id = auth.uid()
      )
    )
    WITH CHECK (
      tutor_name = (
        SELECT profiles.display_name
        FROM public.profiles
        WHERE profiles.id = auth.uid()
      )
    );
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
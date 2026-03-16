CREATE TABLE IF NOT EXISTS public.message_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  tutor_name text NOT NULL,
  archived_by_student boolean NOT NULL DEFAULT false,
  archived_by_tutor boolean NOT NULL DEFAULT false,
  deleted_by_student boolean NOT NULL DEFAULT false,
  deleted_by_tutor boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, tutor_name)
);

ALTER TABLE public.message_conversations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'message_conversations' AND policyname = 'Students can read own conversations'
  ) THEN
    CREATE POLICY "Students can read own conversations"
    ON public.message_conversations
    FOR SELECT TO authenticated
    USING (auth.uid() = student_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'message_conversations' AND policyname = 'Students can insert own conversations'
  ) THEN
    CREATE POLICY "Students can insert own conversations"
    ON public.message_conversations
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = student_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'message_conversations' AND policyname = 'Students can update own conversations'
  ) THEN
    CREATE POLICY "Students can update own conversations"
    ON public.message_conversations
    FOR UPDATE TO authenticated
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'message_conversations' AND policyname = 'Tutors can read own conversations'
  ) THEN
    CREATE POLICY "Tutors can read own conversations"
    ON public.message_conversations
    FOR SELECT TO authenticated
    USING (
      tutor_name = (
        SELECT profiles.display_name FROM public.profiles WHERE profiles.id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'message_conversations' AND policyname = 'Tutors can insert own conversations'
  ) THEN
    CREATE POLICY "Tutors can insert own conversations"
    ON public.message_conversations
    FOR INSERT TO authenticated
    WITH CHECK (
      tutor_name = (
        SELECT profiles.display_name FROM public.profiles WHERE profiles.id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'message_conversations' AND policyname = 'Tutors can update own conversations'
  ) THEN
    CREATE POLICY "Tutors can update own conversations"
    ON public.message_conversations
    FOR UPDATE TO authenticated
    USING (
      tutor_name = (
        SELECT profiles.display_name FROM public.profiles WHERE profiles.id = auth.uid()
      )
    )
    WITH CHECK (
      tutor_name = (
        SELECT profiles.display_name FROM public.profiles WHERE profiles.id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_message_conversations_updated_at'
  ) THEN
    CREATE TRIGGER update_message_conversations_updated_at
    BEFORE UPDATE ON public.message_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS attachment_url text,
ADD COLUMN IF NOT EXISTS attachment_name text,
ADD COLUMN IF NOT EXISTS attachment_type text,
ADD COLUMN IF NOT EXISTS attachment_size integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'message_conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.message_conversations;
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can view own message attachments'
  ) THEN
    CREATE POLICY "Users can view own message attachments"
    ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'message-attachments'
      AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR auth.uid()::text = (storage.foldername(name))[2]
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload own message attachments'
  ) THEN
    CREATE POLICY "Users can upload own message attachments"
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'message-attachments'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own message attachments'
  ) THEN
    CREATE POLICY "Users can update own message attachments"
    ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'message-attachments'
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'message-attachments'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own message attachments'
  ) THEN
    CREATE POLICY "Users can delete own message attachments"
    ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'message-attachments'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;
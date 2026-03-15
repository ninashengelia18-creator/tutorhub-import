
-- Bookings table for lesson scheduling
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tutor_name TEXT NOT NULL,
  tutor_avatar_url TEXT,
  subject TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 50,
  lesson_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT '₾',
  status TEXT NOT NULL DEFAULT 'confirmed',
  is_trial BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Students can read their own bookings
CREATE POLICY "Students can read own bookings"
ON public.bookings FOR SELECT TO authenticated
USING (auth.uid() = student_id);

-- Students can insert their own bookings
CREATE POLICY "Students can insert own bookings"
ON public.bookings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id);

-- Students can update their own bookings
CREATE POLICY "Students can update own bookings"
ON public.bookings FOR UPDATE TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

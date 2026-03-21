
-- Reviews table for students to review tutors after completed lessons
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  tutor_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Students can insert their own reviews
CREATE POLICY "Students can insert own reviews"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Students can read own reviews
CREATE POLICY "Students can read own reviews"
  ON public.reviews FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

-- Tutors can read reviews about them
CREATE POLICY "Tutors can read own reviews"
  ON public.reviews FOR SELECT TO authenticated
  USING (tutor_name = (SELECT display_name FROM profiles WHERE id = auth.uid()));

-- Public can read all reviews (for tutor profiles)
CREATE POLICY "Public can read all reviews"
  ON public.reviews FOR SELECT TO anon, authenticated
  USING (true);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));


ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS google_meet_link text,
  ADD COLUMN IF NOT EXISTS student_name text,
  ADD COLUMN IF NOT EXISTS student_email text,
  ADD COLUMN IF NOT EXISTS student_message text;

-- Allow admins to read all bookings
CREATE POLICY "Admins can read all bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any booking
CREATE POLICY "Admins can update all bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

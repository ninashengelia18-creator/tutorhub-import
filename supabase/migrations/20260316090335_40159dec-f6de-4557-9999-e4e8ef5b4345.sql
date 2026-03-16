CREATE POLICY "Tutors can read own bookings by name"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  tutor_name = (SELECT display_name FROM public.profiles WHERE id = auth.uid())
);
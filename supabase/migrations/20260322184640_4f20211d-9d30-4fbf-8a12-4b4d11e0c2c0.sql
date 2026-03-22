
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cancel_reason text,
  ADD COLUMN IF NOT EXISTS cancel_message text,
  ADD COLUMN IF NOT EXISTS cancelled_by text,
  ADD COLUMN IF NOT EXISTS reschedule_status text,
  ADD COLUMN IF NOT EXISTS reschedule_requested_by text,
  ADD COLUMN IF NOT EXISTS reschedule_reason text,
  ADD COLUMN IF NOT EXISTS reschedule_message text,
  ADD COLUMN IF NOT EXISTS reschedule_new_slot_id uuid REFERENCES public.tutor_availability_slots(id);

-- Allow tutors to update bookings they own (for reschedule/cancel)
CREATE POLICY "Tutors can update own bookings by name"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (tutor_name = (SELECT profiles.display_name FROM profiles WHERE profiles.id = auth.uid()))
  WITH CHECK (tutor_name = (SELECT profiles.display_name FROM profiles WHERE profiles.id = auth.uid()));

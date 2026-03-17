-- Store tutor availability slots in UTC while preserving tutor timezone metadata
CREATE TABLE IF NOT EXISTS public.tutor_availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_name TEXT NOT NULL,
  slot_start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  slot_end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  tutor_timezone TEXT NOT NULL DEFAULT 'UTC',
  availability_status TEXT NOT NULL DEFAULT 'open',
  booked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT tutor_availability_slots_time_order CHECK (slot_end_at > slot_start_at),
  CONSTRAINT tutor_availability_slots_status_check CHECK (availability_status IN ('open', 'booked')),
  CONSTRAINT tutor_availability_slots_unique UNIQUE (tutor_name, slot_start_at)
);

ALTER TABLE public.tutor_availability_slots ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tutor_availability_slots_lookup
ON public.tutor_availability_slots (tutor_name, slot_start_at);

CREATE INDEX IF NOT EXISTS idx_tutor_availability_slots_status
ON public.tutor_availability_slots (availability_status, slot_start_at);

CREATE POLICY "Public can read open tutor availability"
ON public.tutor_availability_slots
FOR SELECT
TO anon, authenticated
USING (availability_status = 'open');

CREATE POLICY "Tutors can read own availability"
ON public.tutor_availability_slots
FOR SELECT
TO authenticated
USING (
  tutor_name = (
    SELECT profiles.display_name
    FROM public.profiles
    WHERE profiles.id = auth.uid()
  )
);

CREATE POLICY "Tutors can insert own availability"
ON public.tutor_availability_slots
FOR INSERT
TO authenticated
WITH CHECK (
  tutor_name = (
    SELECT profiles.display_name
    FROM public.profiles
    WHERE profiles.id = auth.uid()
  )
);

CREATE POLICY "Tutors can update own availability"
ON public.tutor_availability_slots
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

CREATE POLICY "Tutors can delete own availability"
ON public.tutor_availability_slots
FOR DELETE
TO authenticated
USING (
  tutor_name = (
    SELECT profiles.display_name
    FROM public.profiles
    WHERE profiles.id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all availability"
ON public.tutor_availability_slots
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_tutor_availability_slots_updated_at ON public.tutor_availability_slots;
CREATE TRIGGER update_tutor_availability_slots_updated_at
BEFORE UPDATE ON public.tutor_availability_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Extend bookings so a booking can reference the selected slot and tutor timezone
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS tutor_timezone TEXT NOT NULL DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS availability_slot_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'bookings'
      AND constraint_name = 'bookings_availability_slot_id_fkey'
  ) THEN
    ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_availability_slot_id_fkey
    FOREIGN KEY (availability_slot_id)
    REFERENCES public.tutor_availability_slots(id)
    ON DELETE SET NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_availability_slot_id
ON public.bookings (availability_slot_id)
WHERE availability_slot_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_tutor_name_status_lesson_start
ON public.bookings (tutor_name, status, lesson_start_at);

-- Ensure booking UTC timestamps are always synchronized from local date/time + timezone
DROP TRIGGER IF EXISTS sync_booking_schedule_fields_before_write ON public.bookings;
CREATE TRIGGER sync_booking_schedule_fields_before_write
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.sync_booking_schedule_fields();

-- Atomic booking function: reserve an open slot, convert to student-local date/time for storage,
-- and keep canonical UTC timestamps via the booking trigger.
CREATE OR REPLACE FUNCTION public.book_tutor_availability_slot(
  _slot_id UUID,
  _subject TEXT,
  _student_name TEXT,
  _student_email TEXT,
  _student_message TEXT,
  _scheduled_timezone TEXT,
  _price_amount NUMERIC,
  _currency TEXT DEFAULT '₾'
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _slot public.tutor_availability_slots;
  _booking public.bookings;
  _scheduled_timezone_safe TEXT := COALESCE(NULLIF(_scheduled_timezone, ''), 'UTC');
  _local_start TIMESTAMP;
  _local_end TIMESTAMP;
  _duration_minutes INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT *
  INTO _slot
  FROM public.tutor_availability_slots
  WHERE id = _slot_id
  FOR UPDATE;

  IF _slot.id IS NULL THEN
    RAISE EXCEPTION 'Availability slot not found';
  END IF;

  IF _slot.availability_status <> 'open' THEN
    RAISE EXCEPTION 'Availability slot is no longer available';
  END IF;

  _local_start := _slot.slot_start_at AT TIME ZONE _scheduled_timezone_safe;
  _local_end := _slot.slot_end_at AT TIME ZONE _scheduled_timezone_safe;
  _duration_minutes := GREATEST(1, FLOOR(EXTRACT(EPOCH FROM (_slot.slot_end_at - _slot.slot_start_at)) / 60))::INTEGER;

  INSERT INTO public.bookings (
    student_id,
    tutor_name,
    subject,
    lesson_date,
    start_time,
    end_time,
    duration_minutes,
    price_amount,
    currency,
    status,
    student_name,
    student_email,
    student_message,
    notes,
    scheduled_timezone,
    tutor_timezone,
    availability_slot_id
  )
  VALUES (
    auth.uid(),
    _slot.tutor_name,
    _subject,
    _local_start::DATE,
    _local_start::TIME,
    _local_end::TIME,
    _duration_minutes,
    _price_amount,
    COALESCE(NULLIF(_currency, ''), '₾'),
    'pending',
    NULLIF(BTRIM(_student_name), ''),
    NULLIF(BTRIM(_student_email), ''),
    NULLIF(BTRIM(_student_message), ''),
    NULLIF(BTRIM(_student_message), ''),
    _scheduled_timezone_safe,
    COALESCE(NULLIF(_slot.tutor_timezone, ''), 'UTC'),
    _slot.id
  )
  RETURNING * INTO _booking;

  UPDATE public.tutor_availability_slots
  SET availability_status = 'booked',
      booked_at = now()
  WHERE id = _slot.id;

  RETURN _booking;
END;
$$;

GRANT EXECUTE ON FUNCTION public.book_tutor_availability_slot(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT) TO authenticated;
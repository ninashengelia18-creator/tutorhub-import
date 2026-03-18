
CREATE OR REPLACE FUNCTION public.tutor_complete_booking(_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _tutor_display_name TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT display_name INTO _tutor_display_name
  FROM public.profiles
  WHERE id = auth.uid();

  IF _tutor_display_name IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  UPDATE public.bookings
  SET status = 'completed', updated_at = now()
  WHERE id = _booking_id
    AND tutor_name = _tutor_display_name
    AND status = 'confirmed';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or already completed';
  END IF;
END;
$$;

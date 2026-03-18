
CREATE OR REPLACE FUNCTION public.create_earning_on_booking_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _total_minutes INTEGER;
  _total_hours NUMERIC;
  _commission_rate NUMERIC;
  _commission_amount NUMERIC;
  _net_amount NUMERIC;
  _is_trial BOOLEAN;
BEGIN
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (SELECT 1 FROM public.tutor_earnings WHERE booking_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(SUM(duration_minutes), 0)
  INTO _total_minutes
  FROM public.tutor_earnings
  WHERE tutor_name = NEW.tutor_name AND NOT is_trial;

  _total_hours := _total_minutes / 60.0;
  _is_trial := NEW.is_trial;

  IF _is_trial THEN
    _commission_rate := 1.0;
  ELSIF _total_hours >= 100 THEN
    _commission_rate := 0.15;
  ELSIF _total_hours >= 50 THEN
    _commission_rate := 0.17;
  ELSIF _total_hours >= 20 THEN
    _commission_rate := 0.19;
  ELSE
    _commission_rate := 0.22;
  END IF;

  _commission_amount := ROUND(NEW.price_amount * _commission_rate, 2);
  _net_amount := ROUND(NEW.price_amount - _commission_amount, 2);

  INSERT INTO public.tutor_earnings (
    booking_id, tutor_name, student_name, subject,
    lesson_date, lesson_start_at, duration_minutes,
    gross_amount, commission_rate, commission_amount,
    net_amount, is_trial, payout_status
  ) VALUES (
    NEW.id, NEW.tutor_name, NEW.student_name, NEW.subject,
    NEW.lesson_date, NEW.lesson_start_at, NEW.duration_minutes,
    NEW.price_amount, _commission_rate, _commission_amount,
    _net_amount, _is_trial, 'pending'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_earning_on_booking_complete
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_earning_on_booking_complete();

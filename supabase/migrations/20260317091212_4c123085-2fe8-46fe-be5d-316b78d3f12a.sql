-- Add canonical timezone-aware lesson timestamps for bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS scheduled_timezone text,
ADD COLUMN IF NOT EXISTS lesson_start_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS lesson_end_at timestamp with time zone;

-- Backfill timezone from stored user preferences when available
UPDATE public.bookings AS b
SET scheduled_timezone = up.preferred_timezone
FROM public.user_preferences AS up
WHERE b.student_id = up.user_id
  AND (b.scheduled_timezone IS NULL OR b.scheduled_timezone = '');

-- Default remaining legacy bookings to Tbilisi
UPDATE public.bookings
SET scheduled_timezone = 'Asia/Tbilisi'
WHERE scheduled_timezone IS NULL OR scheduled_timezone = '';

-- Backfill UTC timestamps from legacy date/time fields using the stored booking timezone
UPDATE public.bookings
SET lesson_start_at = ((lesson_date::text || ' ' || start_time::text)::timestamp AT TIME ZONE scheduled_timezone),
    lesson_end_at = ((lesson_date::text || ' ' || end_time::text)::timestamp AT TIME ZONE scheduled_timezone)
WHERE lesson_start_at IS NULL OR lesson_end_at IS NULL;

ALTER TABLE public.bookings
ALTER COLUMN scheduled_timezone SET DEFAULT 'UTC',
ALTER COLUMN scheduled_timezone SET NOT NULL;

-- Keep timezone-aware timestamps in sync for future inserts/updates
CREATE OR REPLACE FUNCTION public.sync_booking_schedule_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.scheduled_timezone := COALESCE(NULLIF(NEW.scheduled_timezone, ''), 'UTC');

  IF NEW.lesson_date IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.lesson_start_at := ((NEW.lesson_date::text || ' ' || NEW.start_time::text)::timestamp AT TIME ZONE NEW.scheduled_timezone);
  END IF;

  IF NEW.lesson_date IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    NEW.lesson_end_at := ((NEW.lesson_date::text || ' ' || NEW.end_time::text)::timestamp AT TIME ZONE NEW.scheduled_timezone);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_booking_schedule_fields_trigger ON public.bookings;
CREATE TRIGGER sync_booking_schedule_fields_trigger
BEFORE INSERT OR UPDATE OF lesson_date, start_time, end_time, scheduled_timezone
ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.sync_booking_schedule_fields();

-- Tutor earnings per session
CREATE TABLE public.tutor_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  tutor_name text NOT NULL,
  student_name text,
  subject text NOT NULL,
  lesson_date date NOT NULL,
  lesson_start_at timestamptz,
  duration_minutes integer NOT NULL DEFAULT 50,
  gross_amount numeric NOT NULL DEFAULT 0,
  commission_rate numeric NOT NULL DEFAULT 0,
  commission_amount numeric NOT NULL DEFAULT 0,
  net_amount numeric NOT NULL DEFAULT 0,
  is_trial boolean NOT NULL DEFAULT false,
  payout_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tutor_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can read own earnings"
  ON public.tutor_earnings FOR SELECT TO authenticated
  USING (tutor_name = (SELECT display_name FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage all earnings"
  ON public.tutor_earnings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Payout requests
CREATE TABLE public.payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_name text NOT NULL,
  tutor_user_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL DEFAULT 'wise',
  payment_details text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can read own payout requests"
  ON public.payout_requests FOR SELECT TO authenticated
  USING (tutor_user_id = auth.uid());

CREATE POLICY "Tutors can insert own payout requests"
  ON public.payout_requests FOR INSERT TO authenticated
  WITH CHECK (tutor_user_id = auth.uid());

CREATE POLICY "Admins can manage all payout requests"
  ON public.payout_requests FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

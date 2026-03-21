ALTER TABLE public.conversation_partner_applications ADD COLUMN IF NOT EXISTS timezone text;
ALTER TABLE public.business_inquiries ADD COLUMN IF NOT EXISTS timezone text;
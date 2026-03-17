CREATE POLICY "Admins can read business inquiries"
ON public.business_inquiries
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
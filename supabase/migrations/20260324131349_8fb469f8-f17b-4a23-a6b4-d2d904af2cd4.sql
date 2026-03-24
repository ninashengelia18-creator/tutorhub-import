
-- Allow admins to delete tutor applications
CREATE POLICY "Admins can delete tutor applications"
ON public.tutor_applications
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete conversation partner applications
CREATE POLICY "Admins can delete conversation partner applications"
ON public.conversation_partner_applications
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

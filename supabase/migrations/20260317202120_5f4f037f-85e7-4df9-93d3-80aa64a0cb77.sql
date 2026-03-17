-- Create private bucket for ID documents (not public - admin only)
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-documents', 'id-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone (anon/authenticated) to upload to id-documents bucket
CREATE POLICY "Anyone can upload ID documents"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'id-documents');

-- Only admins can read/download ID documents
CREATE POLICY "Admins can read ID documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'id-documents' AND public.has_role(auth.uid(), 'admin'));

-- Add column to store the document URL
ALTER TABLE public.tutor_applications
ADD COLUMN IF NOT EXISTS id_document_url text;
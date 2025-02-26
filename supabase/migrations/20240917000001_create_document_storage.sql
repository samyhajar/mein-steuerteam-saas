-- Create client-documents bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
  VALUES ('client-documents', 'client-documents', false, false, 104857600, NULL) -- 100MB limit
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Enable RLS on the bucket
UPDATE storage.buckets SET public = false WHERE id = 'client-documents';

-- Create storage policies

-- Clients can upload their own documents
CREATE POLICY "Clients can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-documents' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM clients WHERE user_id = auth.uid()
  )
);

-- Clients can view their own documents
CREATE POLICY "Clients can view their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-documents' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM clients WHERE user_id = auth.uid()
  )
);

-- Accountants can view all client documents
CREATE POLICY "Accountants can view all client documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-documents' AND
  EXISTS (
    SELECT 1 FROM accountant_profiles
    WHERE user_id = auth.uid()
  )
);

-- Accountants can upload documents for any client
CREATE POLICY "Accountants can upload documents for any client"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-documents' AND
  EXISTS (
    SELECT 1 FROM accountant_profiles
    WHERE user_id = auth.uid()
  )
);
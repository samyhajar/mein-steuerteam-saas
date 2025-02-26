-- Create documents table for tracking uploaded files
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  file_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT,
  category TEXT NOT NULL,
  size_bytes BIGINT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries by client_id
CREATE INDEX IF NOT EXISTS documents_client_id_idx ON documents(client_id);

-- Create RLS policies for documents

-- Accountants can see all documents
CREATE POLICY "Accountants can see all documents"
ON documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM accountant_profiles
    WHERE user_id = auth.uid()
  )
);

-- Clients can see their own documents
CREATE POLICY "Clients can see their own documents"
ON documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE id = documents.client_id
    AND user_id = auth.uid()
  )
);

-- Clients can insert their own documents
CREATE POLICY "Clients can insert their own documents"
ON documents
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients
    WHERE id = documents.client_id
    AND user_id = auth.uid()
  )
);
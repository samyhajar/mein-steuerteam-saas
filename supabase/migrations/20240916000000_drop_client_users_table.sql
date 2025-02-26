-- First, add the user_id column to clients table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'clients'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Next, drop the policies that depend on client_users table
DROP POLICY IF EXISTS "Clients can view their own documents" ON documents;
DROP POLICY IF EXISTS "Clients can view their own profile" ON clients;

-- Now drop the client_users table
DROP TABLE IF EXISTS public.client_users;

-- Create new policies that use the direct user_id relationship instead
-- Policy for documents table
CREATE POLICY "Clients can view their own documents"
ON documents
FOR SELECT
USING (auth.uid() = (SELECT user_id FROM clients WHERE id = client_id));

-- Policy for clients table
CREATE POLICY "Clients can view their own profile"
ON clients
FOR SELECT
USING (auth.uid() = user_id);
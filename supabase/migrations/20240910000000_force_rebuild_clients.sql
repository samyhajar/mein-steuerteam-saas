-- Drop and recreate the clients table if it exists
DROP TABLE IF EXISTS clients CASCADE;

-- Create the clients table with all columns
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  accountant_id UUID REFERENCES accountant_profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  client_type TEXT CHECK (client_type IN ('monthly', 'quarterly', 'yearly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Accountants can manage their clients"
  ON clients
  FOR ALL
  USING (accountant_id IN (
    SELECT id FROM accountant_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Clients can view their own profile"
  ON clients
  FOR SELECT
  USING (
    id IN (
      SELECT client_id FROM client_users
      WHERE user_id = auth.uid()
    )
  );
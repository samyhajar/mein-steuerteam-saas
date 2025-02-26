-- Create client table with expanded fields
CREATE TABLE IF NOT EXISTS clients (
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

-- Create client_users table to link clients with auth.users
CREATE TABLE IF NOT EXISTS client_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_client_user UNIQUE(client_id, user_id)
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  category TEXT CHECK (category IN ('einzahlungen', 'ausgaben', 'bank_reports', 'sonstiges')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Accountant access policies
CREATE POLICY "Accountants can manage their clients"
  ON clients
  FOR ALL
  USING (accountant_id IN (
    SELECT id FROM accountant_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Accountants can manage client users"
  ON client_users
  FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE accountant_id IN (
        SELECT id FROM accountant_profiles
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Accountants can manage documents"
  ON documents
  FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE accountant_id IN (
        SELECT id FROM accountant_profiles
        WHERE user_id = auth.uid()
      )
    )
  );

-- Client access policies
CREATE POLICY "Clients can view their own user data"
  ON client_users
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Clients can view their own documents"
  ON documents
  FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM client_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view their own profile"
  ON clients
  FOR SELECT
  USING (
    id IN (
      SELECT client_id FROM client_users
      WHERE user_id = auth.uid()
    )
  );
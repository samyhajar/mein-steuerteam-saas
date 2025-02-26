-- Create schema for accountant profiles
CREATE TABLE accountant_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schema for clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  accountant_id UUID REFERENCES accountant_profiles(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schema for documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  type TEXT NOT NULL, -- 'einzahlungen', 'ausgaben', 'bank_reports', 'sonstiges'
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apply Row Level Security (RLS)
ALTER TABLE accountant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Accountant profiles: users can only see and modify their own profiles
CREATE POLICY "Users can view their own profile"
  ON accountant_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON accountant_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add this policy to allow users to create their own profile
CREATE POLICY "Users can insert their own profile"
  ON accountant_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Clients: accountants can only see their own clients
CREATE POLICY "Accountants can view their own clients"
  ON clients
  FOR SELECT
  USING (
    accountant_id IN (
      SELECT id FROM accountant_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Accountants can insert their own clients"
  ON clients
  FOR INSERT
  WITH CHECK (
    accountant_id IN (
      SELECT id FROM accountant_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Accountants can update their own clients"
  ON clients
  FOR UPDATE
  USING (
    accountant_id IN (
      SELECT id FROM accountant_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Accountants can delete their own clients"
  ON clients
  FOR DELETE
  USING (
    accountant_id IN (
      SELECT id FROM accountant_profiles WHERE user_id = auth.uid()
    )
  );

-- Documents: accountants can only see documents for their clients
CREATE POLICY "Accountants can view their clients' documents"
  ON documents
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE accountant_id IN (
        SELECT id FROM accountant_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Accountants can insert documents for their clients"
  ON documents
  FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients
      WHERE accountant_id IN (
        SELECT id FROM accountant_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Accountants can update their clients' documents"
  ON documents
  FOR UPDATE
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE accountant_id IN (
        SELECT id FROM accountant_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Accountants can delete their clients' documents"
  ON documents
  FOR DELETE
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE accountant_id IN (
        SELECT id FROM accountant_profiles WHERE user_id = auth.uid()
      )
    )
  );
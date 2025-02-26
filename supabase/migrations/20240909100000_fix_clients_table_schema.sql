-- First, let's check if the table exists, if not create it properly
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  accountant_id UUID REFERENCES accountant_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Now add all columns that might be missing (using IF NOT EXISTS for safety)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_type TEXT CHECK (client_type IN ('monthly', 'quarterly', 'yearly'));

-- Make required columns NOT NULL if they aren't already
ALTER TABLE clients ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE clients ALTER COLUMN last_name SET NOT NULL;
ALTER TABLE clients ALTER COLUMN name SET NOT NULL;

-- Set default client type for existing records
UPDATE clients SET client_type = 'monthly' WHERE client_type IS NULL;
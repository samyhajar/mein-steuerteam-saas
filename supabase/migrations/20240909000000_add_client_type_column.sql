-- Add client_type column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_type TEXT CHECK (client_type IN ('monthly', 'quarterly', 'yearly'));

-- Update existing clients to have a default type if needed
UPDATE clients SET client_type = 'monthly' WHERE client_type IS NULL;
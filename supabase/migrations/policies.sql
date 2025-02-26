-- Enable Row Level Security on all tables
ALTER TABLE accountant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

------------------------------------------
-- Accountant Profiles Policies
------------------------------------------

-- View own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'accountant_profiles'
        AND policyname = 'Users can view their own profile'
    ) THEN
        EXECUTE $policy$
        CREATE POLICY "Users can view their own profile"
          ON accountant_profiles
          FOR SELECT
          USING (auth.uid() = user_id);
        $policy$;
    END IF;
END $$;

-- Update own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'accountant_profiles'
        AND policyname = 'Users can update their own profile'
    ) THEN
        EXECUTE $policy$
        CREATE POLICY "Users can update their own profile"
          ON accountant_profiles
          FOR UPDATE
          USING (auth.uid() = user_id);
        $policy$;
    END IF;
END $$;

-- Insert own profile (critical for signup)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'accountant_profiles'
        AND policyname = 'Users can insert their own profile'
    ) THEN
        EXECUTE $policy$
        CREATE POLICY "Users can insert their own profile"
          ON accountant_profiles
          FOR INSERT
          WITH CHECK (auth.uid() = user_id);
        $policy$;
    END IF;
END $$;

-- Delete own profile (optional)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'accountant_profiles'
        AND policyname = 'Users can delete their own profile'
    ) THEN
        EXECUTE $policy$
        CREATE POLICY "Users can delete their own profile"
          ON accountant_profiles
          FOR DELETE
          USING (auth.uid() = user_id);
        $policy$;
    END IF;
END $$;

------------------------------------------
-- Clients Policies
------------------------------------------

-- View own clients
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'clients'
        AND policyname = 'Accountants can view their own clients'
    ) THEN
        EXECUTE $policy$
        CREATE POLICY "Accountants can view their own clients"
          ON clients
          FOR SELECT
          USING (
            accountant_id IN (
              SELECT id FROM accountant_profiles WHERE user_id = auth.uid()
            )
          );
        $policy$;
    END IF;
END $$;

-- Insert own clients
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'clients'
        AND policyname = 'Accountants can insert their own clients'
    ) THEN
        EXECUTE $policy$
        CREATE POLICY "Accountants can insert their own clients"
          ON clients
          FOR INSERT
          WITH CHECK (
            accountant_id IN (
              SELECT id FROM accountant_profiles WHERE user_id = auth.uid()
            )
          );
        $policy$;
    END IF;
END $$;

-- Update own clients
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'clients'
        AND policyname = 'Accountants can update their own clients'
    ) THEN
        EXECUTE $policy$
        CREATE POLICY "Accountants can update their own clients"
          ON clients
          FOR UPDATE
          USING (
            accountant_id IN (
              SELECT id FROM accountant_profiles WHERE user_id = auth.uid()
            )
          );
        $policy$;
    END IF;
END $$;

-- Delete own clients
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'clients'
        AND policyname = 'Accountants can delete their own clients'
    ) THEN
        EXECUTE $policy$
        CREATE POLICY "Accountants can delete their own clients"
          ON clients
          FOR DELETE
          USING (
            accountant_id IN (
              SELECT id FROM accountant_profiles WHERE user_id = auth.uid()
            )
          );
        $policy$;
    END IF;
END $$;

------------------------------------------
-- Documents Policies
------------------------------------------

-- View documents for own clients
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'documents'
        AND policyname = 'Accountants can view their clients'' documents'
    ) THEN
        EXECUTE $policy$
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
        $policy$;
    END IF;
END $$;

-- Insert documents for own clients
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'documents'
        AND policyname = 'Accountants can insert documents for their clients'
    ) THEN
        EXECUTE $policy$
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
        $policy$;
    END IF;
END $$;

-- Update documents for own clients
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'documents'
        AND policyname = 'Accountants can update their clients'' documents'
    ) THEN
        EXECUTE $policy$
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
        $policy$;
    END IF;
END $$;

-- Delete documents for own clients
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'documents'
        AND policyname = 'Accountants can delete their clients'' documents'
    ) THEN
        EXECUTE $policy$
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
        $policy$;
    END IF;
END $$;
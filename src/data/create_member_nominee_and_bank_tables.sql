-- ==============================================================================
-- SQL to Create 'member_nominees' & 'member_bank_details' Tables in Supabase
-- Separate tables specifically for registered Trust Members (distinct from official Trust bank account)
-- Run this in your Supabase Project -> SQL Editor -> Run
-- ==============================================================================

-- 1. Ensure API roles have permissions on public schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 2. CREATE 'member_nominees' TABLE
-- Allows members to designate verified nominee/heir for mutual assistance solace
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.member_nominees (
  id TEXT PRIMARY KEY DEFAULT ('nom_' || floor(extract(epoch from now()) * 1000)::text),
  user_id TEXT NOT NULL,
  nominee_name TEXT NOT NULL,
  relation TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  date_of_birth TEXT DEFAULT '',
  age INTEGER DEFAULT NULL,
  aadhaar_number TEXT DEFAULT '',
  id_proof_url TEXT DEFAULT '',
  address TEXT DEFAULT '',
  share_percentage INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist for existing tables
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL;
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS nominee_name TEXT NOT NULL;
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS relation TEXT NOT NULL;
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL;
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS date_of_birth TEXT DEFAULT '';
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS age INTEGER DEFAULT NULL;
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS aadhaar_number TEXT DEFAULT '';
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS id_proof_url TEXT DEFAULT '';
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS share_percentage INTEGER DEFAULT 100;
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_member_nominees_user_id ON public.member_nominees(user_id);

-- Enable RLS and setup access policies
ALTER TABLE public.member_nominees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select member_nominees" ON public.member_nominees;
CREATE POLICY "Allow select member_nominees" ON public.member_nominees FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert member_nominees" ON public.member_nominees;
CREATE POLICY "Allow insert member_nominees" ON public.member_nominees FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update member_nominees" ON public.member_nominees;
CREATE POLICY "Allow update member_nominees" ON public.member_nominees FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete member_nominees" ON public.member_nominees;
CREATE POLICY "Allow delete member_nominees" ON public.member_nominees FOR DELETE USING (true);

-- ------------------------------------------------------------------------------
-- 3. CREATE 'member_bank_details' TABLE
-- Separate table for member personal bank details (distinct from Trust's account_details)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.member_bank_details (
  id TEXT PRIMARY KEY DEFAULT ('mbank_' || floor(extract(epoch from now()) * 1000)::text),
  user_id TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  branch_name TEXT DEFAULT '',
  account_type TEXT DEFAULT 'Savings',
  upi_id TEXT DEFAULT '',
  passbook_or_cheque_url TEXT DEFAULT '',
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist for existing tables
ALTER TABLE public.member_bank_details ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL;
ALTER TABLE public.member_bank_details ADD COLUMN IF NOT EXISTS account_holder_name TEXT NOT NULL;
ALTER TABLE public.member_bank_details ADD COLUMN IF NOT EXISTS bank_name TEXT NOT NULL;
ALTER TABLE public.member_bank_details ADD COLUMN IF NOT EXISTS account_number TEXT NOT NULL;
ALTER TABLE public.member_bank_details ADD COLUMN IF NOT EXISTS ifsc_code TEXT NOT NULL;
ALTER TABLE public.member_bank_details ADD COLUMN IF NOT EXISTS branch_name TEXT DEFAULT '';
ALTER TABLE public.member_bank_details ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'Savings';
ALTER TABLE public.member_bank_details ADD COLUMN IF NOT EXISTS upi_id TEXT DEFAULT '';
ALTER TABLE public.member_bank_details ADD COLUMN IF NOT EXISTS passbook_or_cheque_url TEXT DEFAULT '';
ALTER TABLE public.member_bank_details ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT true;
ALTER TABLE public.member_bank_details ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.member_bank_details ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_member_bank_details_user_id ON public.member_bank_details(user_id);

-- Enable RLS and setup access policies
ALTER TABLE public.member_bank_details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select member_bank_details" ON public.member_bank_details;
CREATE POLICY "Allow select member_bank_details" ON public.member_bank_details FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert member_bank_details" ON public.member_bank_details;
CREATE POLICY "Allow insert member_bank_details" ON public.member_bank_details FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update member_bank_details" ON public.member_bank_details;
CREATE POLICY "Allow update member_bank_details" ON public.member_bank_details FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete member_bank_details" ON public.member_bank_details;
CREATE POLICY "Allow delete member_bank_details" ON public.member_bank_details FOR DELETE USING (true);

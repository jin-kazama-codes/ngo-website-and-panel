-- ==============================================================================
-- SQL to Create 'member_female_family' Table in Supabase
-- Covers BOTH 'public' and 'dev' schemas and disables RLS so mobile & web never hit RLS errors
-- Run this in your Supabase Project -> SQL Editor -> Run
-- ==============================================================================

-- 1. Ensure schemas exist
CREATE SCHEMA IF NOT EXISTS dev;

-- 2. Grant permissions to all API roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA dev TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA dev TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA dev TO postgres, anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 3. CREATE 'public.member_female_family' TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.member_female_family (
  id TEXT PRIMARY KEY DEFAULT ('ffm_' || floor(extract(epoch from now()) * 1000)::text),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  age INTEGER DEFAULT NULL,
  date_of_birth TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  aadhaar_number TEXT DEFAULT '',
  address TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  fee_amount INTEGER DEFAULT 50,
  payment_method TEXT DEFAULT 'UPI',
  payment_utr TEXT DEFAULT '',
  payment_screenshot_url TEXT DEFAULT '',
  status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  rejection_reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist for existing tables
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL;
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS name TEXT NOT NULL;
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS relation TEXT NOT NULL;
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS age INTEGER DEFAULT NULL;
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS date_of_birth TEXT DEFAULT '';
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS aadhaar_number TEXT DEFAULT '';
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT '';
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS fee_amount INTEGER DEFAULT 50;
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'UPI';
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS payment_utr TEXT DEFAULT '';
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT DEFAULT '';
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT '';
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_member_female_family_user_id ON public.member_female_family(user_id);
CREATE INDEX IF NOT EXISTS idx_member_female_family_status ON public.member_female_family(status);

-- ------------------------------------------------------------------------------
-- 4. CREATE 'dev.member_female_family' TABLE (for Mobile App dev environment)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dev.member_female_family (
  id TEXT PRIMARY KEY DEFAULT ('ffm_' || floor(extract(epoch from now()) * 1000)::text),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  age INTEGER DEFAULT NULL,
  date_of_birth TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  aadhaar_number TEXT DEFAULT '',
  address TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  fee_amount INTEGER DEFAULT 50,
  payment_method TEXT DEFAULT 'UPI',
  payment_utr TEXT DEFAULT '',
  payment_screenshot_url TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist for existing tables in dev
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL;
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS name TEXT NOT NULL;
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS relation TEXT NOT NULL;
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS age INTEGER DEFAULT NULL;
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS date_of_birth TEXT DEFAULT '';
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS aadhaar_number TEXT DEFAULT '';
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT '';
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS fee_amount INTEGER DEFAULT 50;
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'UPI';
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS payment_utr TEXT DEFAULT '';
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT DEFAULT '';
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT '';
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_dev_member_female_family_user_id ON dev.member_female_family(user_id);
CREATE INDEX IF NOT EXISTS idx_dev_member_female_family_status ON dev.member_female_family(status);

-- ------------------------------------------------------------------------------
-- 5. DISABLE ROW LEVEL SECURITY (RLS) ON BOTH SCHEMAS
-- Completely eliminates "violates row-level security policy" errors
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.member_female_family DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev.member_female_family DISABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 6. GRANT ALL PRIVILEGES TO ALL ROLES ON BOTH TABLES
-- ------------------------------------------------------------------------------
GRANT ALL ON TABLE public.member_female_family TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE dev.member_female_family TO postgres, anon, authenticated, service_role;

-- Setup backup open policies in case RLS is ever enabled
DROP POLICY IF EXISTS "Allow all member_female_family_public" ON public.member_female_family;
CREATE POLICY "Allow all member_female_family_public" ON public.member_female_family FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all member_female_family_dev" ON dev.member_female_family;
CREATE POLICY "Allow all member_female_family_dev" ON dev.member_female_family FOR ALL USING (true) WITH CHECK (true);

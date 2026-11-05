-- ==============================================================================
-- SQL to Add Photo and Aadhaar Front/Back Document Columns
-- For 'member_nominees' and 'member_female_family' Tables in Supabase
-- Run this in your Supabase Project -> SQL Editor -> Run
-- ==============================================================================

-- 1. Ensure columns exist on public.member_nominees
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT '';
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS aadhaar_front_url TEXT DEFAULT '';
ALTER TABLE public.member_nominees ADD COLUMN IF NOT EXISTS aadhaar_back_url TEXT DEFAULT '';

-- 2. Ensure columns exist on public.member_female_family
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT '';
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS aadhaar_front_url TEXT DEFAULT '';
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS aadhaar_back_url TEXT DEFAULT '';

-- 3. If dev schema is used, ensure columns exist there too
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'dev') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'dev' AND table_name = 'member_nominees') THEN
      ALTER TABLE dev.member_nominees ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT '';
      ALTER TABLE dev.member_nominees ADD COLUMN IF NOT EXISTS aadhaar_front_url TEXT DEFAULT '';
      ALTER TABLE dev.member_nominees ADD COLUMN IF NOT EXISTS aadhaar_back_url TEXT DEFAULT '';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'dev' AND table_name = 'member_female_family') THEN
      ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT '';
      ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS aadhaar_front_url TEXT DEFAULT '';
      ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS aadhaar_back_url TEXT DEFAULT '';
    END IF;
  END IF;
END $$;


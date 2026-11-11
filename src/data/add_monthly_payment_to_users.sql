-- ==============================================================================
-- SQL to Add Monthly Payment columns to 'users' table in Supabase
-- Default is 'no' (Users opt in via toggle)
-- Run this in your Supabase Project -> SQL Editor -> Run
-- ==============================================================================

-- 1. Ensure monthly_payment columns exist on public.users with default 'no'
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS monthly_payment TEXT DEFAULT 'no';
ALTER TABLE public.users ALTER COLUMN monthly_payment SET DEFAULT 'no';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS monthly_payment_date TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS monthly_payment_amount NUMERIC DEFAULT 0;

-- 2. Set NULL rows to 'no' without overwriting existing opted-in users
UPDATE public.users
SET monthly_payment = 'no'
WHERE monthly_payment IS NULL;

-- 3. If dev schema is used, ensure columns exist there too
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'dev') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'dev' AND table_name = 'users') THEN
      ALTER TABLE dev.users ADD COLUMN IF NOT EXISTS monthly_payment TEXT DEFAULT 'no';
      ALTER TABLE dev.users ALTER COLUMN monthly_payment SET DEFAULT 'no';
      ALTER TABLE dev.users ADD COLUMN IF NOT EXISTS monthly_payment_date TEXT;
      ALTER TABLE dev.users ADD COLUMN IF NOT EXISTS monthly_payment_amount NUMERIC DEFAULT 0;

      UPDATE dev.users
      SET monthly_payment = 'no'
      WHERE monthly_payment IS NULL;
    END IF;
  END IF;
END $$;

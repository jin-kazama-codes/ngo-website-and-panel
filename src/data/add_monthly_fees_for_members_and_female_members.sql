-- ==============================================================================
-- SQL Migration: Default Monthly Payment = 'no' + Female Member Monthly Fees
-- Covers BOTH 'public' and 'dev' schemas in Supabase.
-- Run this in your Supabase Project -> SQL Editor -> Run
-- ==============================================================================

-- 1. USERS TABLE: Default monthly_payment to 'no'
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS monthly_payment TEXT DEFAULT 'no';
ALTER TABLE public.users ALTER COLUMN monthly_payment SET DEFAULT 'no';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS monthly_payment_date TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS monthly_payment_amount NUMERIC DEFAULT 0;

UPDATE public.users
SET monthly_payment = 'no'
WHERE monthly_payment IS NULL;

-- 2. MEMBER_FEMALE_FAMILY TABLE: Monthly fee tracking columns (default 'no')
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS monthly_payment TEXT DEFAULT 'no';
ALTER TABLE public.member_female_family ALTER COLUMN monthly_payment SET DEFAULT 'no';
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS monthly_payment_date TEXT;
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS monthly_payment_amount NUMERIC DEFAULT 0;
ALTER TABLE public.member_female_family ADD COLUMN IF NOT EXISTS last_monthly_utr TEXT DEFAULT '';

UPDATE public.member_female_family
SET monthly_payment = 'no'
WHERE monthly_payment IS NULL;

-- 3. DONATIONS TABLE: Monthly payment attribution (Primary vs Female Members)
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'donation';
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS female_member_id TEXT;
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS female_member_name TEXT;
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS billing_month TEXT;
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS monthly_breakdown JSONB;

CREATE INDEX IF NOT EXISTS idx_donations_payment_type ON public.donations(payment_type);
CREATE INDEX IF NOT EXISTS idx_donations_female_member_id ON public.donations(female_member_id);
CREATE INDEX IF NOT EXISTS idx_donations_billing_month ON public.donations(billing_month);

-- 4. DEV SCHEMA MIRROR (if dev schema exists)
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

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'dev' AND table_name = 'member_female_family') THEN
      ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS monthly_payment TEXT DEFAULT 'no';
      ALTER TABLE dev.member_female_family ALTER COLUMN monthly_payment SET DEFAULT 'no';
      ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS monthly_payment_date TEXT;
      ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS monthly_payment_amount NUMERIC DEFAULT 0;
      ALTER TABLE dev.member_female_family ADD COLUMN IF NOT EXISTS last_monthly_utr TEXT DEFAULT '';

      UPDATE dev.member_female_family
      SET monthly_payment = 'no'
      WHERE monthly_payment IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'dev' AND table_name = 'donations') THEN
      ALTER TABLE dev.donations ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'donation';
      ALTER TABLE dev.donations ADD COLUMN IF NOT EXISTS female_member_id TEXT;
      ALTER TABLE dev.donations ADD COLUMN IF NOT EXISTS female_member_name TEXT;
      ALTER TABLE dev.donations ADD COLUMN IF NOT EXISTS billing_month TEXT;
      ALTER TABLE dev.donations ADD COLUMN IF NOT EXISTS monthly_breakdown JSONB;

      CREATE INDEX IF NOT EXISTS idx_dev_donations_payment_type ON dev.donations(payment_type);
      CREATE INDEX IF NOT EXISTS idx_dev_donations_female_member_id ON dev.donations(female_member_id);
      CREATE INDEX IF NOT EXISTS idx_dev_donations_billing_month ON dev.donations(billing_month);
    END IF;
  END IF;
END $$;

ALTER TABLE public.account_details
  ADD COLUMN IF NOT EXISTS account_holder_name text,
  ADD COLUMN IF NOT EXISTS branch_name text;

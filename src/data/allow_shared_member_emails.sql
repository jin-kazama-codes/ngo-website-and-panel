-- Run once in Supabase SQL Editor to allow multiple member records per email.
-- Membership IDs remain unique and are used to identify individual accounts.
BEGIN;

DO $$
DECLARE
  email_attnum smallint;
  email_constraint record;
  email_index record;
BEGIN
  SELECT attnum
  INTO email_attnum
  FROM pg_attribute
  WHERE attrelid = 'public.users'::regclass
    AND attname = 'email'
    AND NOT attisdropped;

  IF email_attnum IS NULL THEN
    RAISE EXCEPTION 'public.users.email column does not exist';
  END IF;

  FOR email_constraint IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass
      AND contype = 'u'
      AND conkey = ARRAY[email_attnum]::smallint[]
  LOOP
    EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', email_constraint.conname);
  END LOOP;

  FOR email_index IN
    SELECT index_class.relname AS index_name
    FROM pg_index AS indexes
    JOIN pg_class AS index_class ON index_class.oid = indexes.indexrelid
    WHERE indexes.indrelid = 'public.users'::regclass
      AND indexes.indisunique
      AND NOT indexes.indisprimary
      AND indexes.indnkeyatts = 1
      AND indexes.indkey[0] = email_attnum
  LOOP
    EXECUTE format('DROP INDEX public.%I', email_index.index_name);
  END LOOP;
END;
$$;

COMMIT;

-- Run once in Supabase SQL Editor before deploying the updated mobile app and website.
-- Existing membership IDs are reassigned in creation order to the MFCT-00001 format.
BEGIN;

LOCK TABLE public.users IN ACCESS EXCLUSIVE MODE;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS membership_fee integer NOT NULL DEFAULT 100;

WITH numbered_users AS (
  SELECT id, row_number() OVER (ORDER BY created_at NULLS FIRST, id) AS sequence_number
  FROM public.users
)
UPDATE public.users AS users
SET membership_id = 'MFCT-' || lpad(numbered_users.sequence_number::text, 5, '0')
FROM numbered_users
WHERE users.id = numbered_users.id;

CREATE SEQUENCE IF NOT EXISTS public.membership_id_sequence START WITH 1;

DO $$
DECLARE
  member_count bigint;
BEGIN
  SELECT count(*) INTO member_count FROM public.users;
  IF member_count = 0 THEN
    PERFORM setval('public.membership_id_sequence', 1, false);
  ELSE
    PERFORM setval('public.membership_id_sequence', member_count, true);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_membership_id_and_fee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.membership_id := 'MFCT-' || lpad(nextval('public.membership_id_sequence')::text, 5, '0');
  NEW.membership_fee := 100;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_membership_id_and_fee() FROM PUBLIC;

DROP TRIGGER IF EXISTS assign_membership_id_and_fee ON public.users;
CREATE TRIGGER assign_membership_id_and_fee
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_membership_id_and_fee();

CREATE UNIQUE INDEX IF NOT EXISTS users_membership_id_unique_idx
  ON public.users (membership_id);

COMMIT;

-- Run once in the app's configured Supabase schema before enabling password recovery.
-- OTP records are server-only and keyed by membership ID, not email alone.
BEGIN;

CREATE TABLE IF NOT EXISTS password_reset_otps (
  membership_id text PRIMARY KEY,
  email text NOT NULL,
  otp_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts smallint NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE password_reset_otps ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE password_reset_otps FROM anon, authenticated;
GRANT ALL ON TABLE password_reset_otps TO service_role;

COMMIT;

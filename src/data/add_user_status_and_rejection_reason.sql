-- Migration: Add status and rejection_reason columns to the users table
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New query)

ALTER TABLE users ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Optional: backfill existing records based on is_verified
UPDATE users 
SET status = 'approved' 
WHERE is_verified = TRUE AND (status IS NULL OR status = 'pending');

UPDATE users 
SET status = 'pending' 
WHERE (is_verified IS NULL OR is_verified = FALSE) AND status IS NULL;

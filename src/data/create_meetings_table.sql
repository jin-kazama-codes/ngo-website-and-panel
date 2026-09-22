-- ==============================================================================
-- SQL to Update or Create 'meeting' / 'meetings' Table in Supabase (PostgreSQL)
-- Run this in your Supabase Project -> SQL Editor -> Run
-- ==============================================================================

-- 1. If you created table named 'meeting' in 'dev' schema:
-- Fix 'time' column type: it must be TEXT (not DATE) to support ranges like "11:00 AM - 01:00 PM"
ALTER TABLE IF EXISTS dev.meeting DROP COLUMN IF EXISTS time;
ALTER TABLE IF EXISTS dev.meeting ADD COLUMN time TEXT DEFAULT '11:00 AM - 01:00 PM';

ALTER TABLE IF EXISTS dev.meeting
  ADD COLUMN IF NOT EXISTS agenda TEXT,
  ADD COLUMN IF NOT EXISTS venue TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS chairperson TEXT DEFAULT 'District President',
  ADD COLUMN IF NOT EXISTS recorded_by TEXT DEFAULT 'District Secretary',
  ADD COLUMN IF NOT EXISTS attendees_count INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming',
  ADD COLUMN IF NOT EXISTS district TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS minutes TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS resolutions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS and grant full permissions on dev.meeting
ALTER TABLE IF EXISTS dev.meeting ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read meeting" ON dev.meeting;
CREATE POLICY "Allow public read meeting" ON dev.meeting FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert meeting" ON dev.meeting;
CREATE POLICY "Allow insert meeting" ON dev.meeting FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update meeting" ON dev.meeting;
CREATE POLICY "Allow update meeting" ON dev.meeting FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete meeting" ON dev.meeting;
CREATE POLICY "Allow delete meeting" ON dev.meeting FOR DELETE USING (true);


-- 2. Also ensure 'dev.meetings' (plural) is supported if needed:
CREATE TABLE IF NOT EXISTS dev.meetings (
  id TEXT PRIMARY KEY DEFAULT ('meet-' || floor(extract(epoch from now()) * 1000)::text),
  title TEXT NOT NULL,
  agenda TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '11:00 AM - 01:00 PM',
  venue TEXT DEFAULT '',
  chairperson TEXT DEFAULT 'District President',
  recorded_by TEXT DEFAULT 'District Secretary',
  attendees_count INTEGER DEFAULT 10,
  status TEXT DEFAULT 'upcoming',
  district TEXT DEFAULT '',
  minutes TEXT DEFAULT '',
  resolutions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dev.meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read meetings" ON dev.meetings;
CREATE POLICY "Allow public read meetings" ON dev.meetings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert meetings" ON dev.meetings;
CREATE POLICY "Allow insert meetings" ON dev.meetings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update meetings" ON dev.meetings;
CREATE POLICY "Allow update meetings" ON dev.meetings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete meetings" ON dev.meetings;
CREATE POLICY "Allow delete meetings" ON dev.meetings FOR DELETE USING (true);

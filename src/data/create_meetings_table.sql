-- ==============================================================================
-- SQL to Create 'meeting' / 'meetings' Table in Supabase (PostgreSQL) - PUBLIC SCHEMA
-- Run this in your Supabase Project -> SQL Editor -> Run
-- ==============================================================================

-- 1. Ensure API roles have permissions on public schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Create 'meeting' in 'public' schema
CREATE TABLE IF NOT EXISTS public.meeting (
  id TEXT PRIMARY KEY DEFAULT ('meet-' || floor(extract(epoch from now()) * 1000)::text),
  title TEXT NOT NULL,
  agenda TEXT DEFAULT '',
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

-- Ensure all columns exist on public.meeting
ALTER TABLE public.meeting ADD COLUMN IF NOT EXISTS agenda TEXT DEFAULT '';
ALTER TABLE public.meeting ADD COLUMN IF NOT EXISTS time TEXT DEFAULT '11:00 AM - 01:00 PM';
ALTER TABLE public.meeting ADD COLUMN IF NOT EXISTS venue TEXT DEFAULT '';
ALTER TABLE public.meeting ADD COLUMN IF NOT EXISTS chairperson TEXT DEFAULT 'District President';
ALTER TABLE public.meeting ADD COLUMN IF NOT EXISTS recorded_by TEXT DEFAULT 'District Secretary';
ALTER TABLE public.meeting ADD COLUMN IF NOT EXISTS attendees_count INTEGER DEFAULT 10;
ALTER TABLE public.meeting ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming';
ALTER TABLE public.meeting ADD COLUMN IF NOT EXISTS district TEXT DEFAULT '';
ALTER TABLE public.meeting ADD COLUMN IF NOT EXISTS minutes TEXT DEFAULT '';
ALTER TABLE public.meeting ADD COLUMN IF NOT EXISTS resolutions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.meeting ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS and create policies for public.meeting
ALTER TABLE public.meeting ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read meeting" ON public.meeting;
CREATE POLICY "Allow public read meeting" ON public.meeting FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert meeting" ON public.meeting;
CREATE POLICY "Allow insert meeting" ON public.meeting FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update meeting" ON public.meeting;
CREATE POLICY "Allow update meeting" ON public.meeting FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete meeting" ON public.meeting;
CREATE POLICY "Allow delete meeting" ON public.meeting FOR DELETE USING (true);

-- 3. Also create 'public.meetings' and 'public.district_meetings' tables
CREATE TABLE IF NOT EXISTS public.meetings (LIKE public.meeting INCLUDING ALL);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read meetings" ON public.meetings;
CREATE POLICY "Allow public read meetings" ON public.meetings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert meetings" ON public.meetings;
CREATE POLICY "Allow insert meetings" ON public.meetings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update meetings" ON public.meetings;
CREATE POLICY "Allow update meetings" ON public.meetings FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete meetings" ON public.meetings;
CREATE POLICY "Allow delete meetings" ON public.meetings FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS public.district_meetings (LIKE public.meeting INCLUDING ALL);
ALTER TABLE public.district_meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read district_meetings" ON public.district_meetings;
CREATE POLICY "Allow public read district_meetings" ON public.district_meetings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert district_meetings" ON public.district_meetings;
CREATE POLICY "Allow insert district_meetings" ON public.district_meetings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update district_meetings" ON public.district_meetings;
CREATE POLICY "Allow update district_meetings" ON public.district_meetings FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete district_meetings" ON public.district_meetings;
CREATE POLICY "Allow delete district_meetings" ON public.district_meetings FOR DELETE USING (true);

-- 4. Copy existing data from dev.meeting to public.meeting if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'dev' AND table_name = 'meeting'
  ) THEN
    INSERT INTO public.meeting (
      id, title, agenda, date, time, venue, chairperson, recorded_by,
      attendees_count, status, district, minutes, resolutions, created_at, updated_at
    )
    SELECT
      id, title, agenda, date, time, venue, chairperson, recorded_by,
      attendees_count, status, district, minutes, resolutions, created_at, updated_at
    FROM dev.meeting
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

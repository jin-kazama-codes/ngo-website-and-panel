-- ==============================================================================
-- SQL to Create 'district_teams' / 'teams' Table in Supabase (PostgreSQL)
-- Run this in your Supabase Project -> SQL Editor -> Run
-- ==============================================================================

-- 1. Ensure API roles have permissions on dev schema
GRANT USAGE ON SCHEMA dev TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA dev TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA dev TO postgres, anon, authenticated, service_role;

-- 2. Create 'district_teams' in 'dev' schema
CREATE TABLE IF NOT EXISTS dev.district_teams (
  id TEXT PRIMARY KEY DEFAULT ('team-' || floor(extract(epoch from now()) * 1000)::text),
  unit_name TEXT NOT NULL,
  unit_type TEXT DEFAULT 'block',
  tehsil_or_zone TEXT DEFAULT '',
  district TEXT DEFAULT '',
  president_name TEXT NOT NULL,
  president_phone TEXT DEFAULT '',
  secretary_name TEXT NOT NULL,
  secretary_phone TEXT DEFAULT '',
  coordinator_name TEXT DEFAULT '',
  coordinator_phone TEXT DEFAULT '',
  formed_date TEXT DEFAULT '',
  active_volunteers_count INTEGER DEFAULT 15,
  status TEXT DEFAULT 'active',
  objectives TEXT DEFAULT '',
  members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create full access policies for dev.district_teams
ALTER TABLE dev.district_teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read district_teams" ON dev.district_teams;
CREATE POLICY "Allow public read district_teams" ON dev.district_teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert district_teams" ON dev.district_teams;
CREATE POLICY "Allow insert district_teams" ON dev.district_teams FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update district_teams" ON dev.district_teams;
CREATE POLICY "Allow update district_teams" ON dev.district_teams FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete district_teams" ON dev.district_teams;
CREATE POLICY "Allow delete district_teams" ON dev.district_teams FOR DELETE USING (true);


-- 3. Also support 'dev.teams' as an alternative table name
CREATE TABLE IF NOT EXISTS dev.teams (
  id TEXT PRIMARY KEY DEFAULT ('team-' || floor(extract(epoch from now()) * 1000)::text),
  unit_name TEXT NOT NULL,
  unit_type TEXT DEFAULT 'block',
  tehsil_or_zone TEXT DEFAULT '',
  district TEXT DEFAULT '',
  president_name TEXT NOT NULL,
  president_phone TEXT DEFAULT '',
  secretary_name TEXT NOT NULL,
  secretary_phone TEXT DEFAULT '',
  coordinator_name TEXT DEFAULT '',
  coordinator_phone TEXT DEFAULT '',
  formed_date TEXT DEFAULT '',
  active_volunteers_count INTEGER DEFAULT 15,
  status TEXT DEFAULT 'active',
  objectives TEXT DEFAULT '',
  members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dev.teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read teams" ON dev.teams;
CREATE POLICY "Allow public read teams" ON dev.teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert teams" ON dev.teams;
CREATE POLICY "Allow insert teams" ON dev.teams FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update teams" ON dev.teams;
CREATE POLICY "Allow update teams" ON dev.teams FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete teams" ON dev.teams;
CREATE POLICY "Allow delete teams" ON dev.teams FOR DELETE USING (true);


-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

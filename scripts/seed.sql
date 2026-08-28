-- ============================================================
-- MFCT / SevaSangam — Supabase Complete Schema & Seed Data
-- Project: tyiecstaywsocmqsabhg
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── 1. communities ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communities (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  
  city              TEXT NOT NULL,
  state             TEXT NOT NULL,
  admin_name        TEXT NOT NULL,
  admin_role_title  TEXT NOT NULL,
  avatar            TEXT,
  total_members     INT  DEFAULT 0,
  active_campaigns  INT  DEFAULT 0,
  total_raised_inr  BIGINT DEFAULT 0,
  health_score      INT  DEFAULT 100,
  verified_status   TEXT DEFAULT 'Verified',
  description       TEXT,
  established_year  INT,
  cover_image       TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. users ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  email                 TEXT UNIQUE NOT NULL,
  phone                 TEXT,
  role                  TEXT NOT NULL DEFAULT 'member',
  avatar                TEXT,
  community_id          TEXT REFERENCES communities(id),
  community_name        TEXT,
  membership_id         TEXT UNIQUE,
  is_verified           BOOLEAN DEFAULT FALSE,
  is_premium            BOOLEAN DEFAULT FALSE,
  join_date             TEXT,
  city                  TEXT,
  state                 TEXT,
  total_donated_inr     INT DEFAULT 0,
  donations_count       INT DEFAULT 0,
  life_impact_score     INT,
  families_helped       INT,
  hasanat_counter       INT,
  giving_streak_months  INT,
  community_rank        INT,
  kyc_document_url      TEXT,
  password_hash         TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. campaigns ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id                    TEXT PRIMARY KEY,
  title                 TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  category              TEXT NOT NULL,
  community_id          TEXT REFERENCES communities(id),
  community_name        TEXT,
  city                  TEXT,
  beneficiary_name      TEXT,
  beneficiary_relation  TEXT,
  goal_inr              BIGINT NOT NULL,
  raised_inr            BIGINT DEFAULT 0,
  donors_count          INT    DEFAULT 0,
  days_left             INT    DEFAULT 30,
  is_verified           BOOLEAN DEFAULT FALSE,
  is_zakat_eligible     BOOLEAN DEFAULT FALSE,
  is_urgent             BOOLEAN DEFAULT FALSE,
  is_premium_featured   BOOLEAN DEFAULT FALSE,
  main_image            TEXT,
  story                 TEXT,
  documents             JSONB  DEFAULT '[]',
  verification_timeline JSONB  DEFAULT '[]',
  need_breakdown        JSONB  DEFAULT '[]',
  created_date          TEXT,
  status                TEXT   DEFAULT 'pending_approval',
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. donations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
  id                     TEXT PRIMARY KEY,
  transaction_id         TEXT,
  utr_number             TEXT,
  donor_name             TEXT NOT NULL,
  donor_id               TEXT REFERENCES users(id),
  donor_role             TEXT,
  campaign_id            TEXT REFERENCES campaigns(id),
  campaign_title         TEXT,
  community_name         TEXT,
  amount_inr             INT  NOT NULL,
  category               TEXT NOT NULL,
  is_outside_community   BOOLEAN DEFAULT FALSE,
  payment_method         TEXT,
  payment_screenshot_url TEXT,
  status                 TEXT DEFAULT 'pending_verification',
  date                   TEXT,
  receipt_number         TEXT UNIQUE,
  created_at             TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. pending_verifications ────────────────────────────────
CREATE TABLE IF NOT EXISTS pending_verifications (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  submitted_by  TEXT,
  date          TEXT,
  status        TEXT DEFAULT 'pending',
  details       TEXT,
  document_url  TEXT,
  amount_inr    INT,
  utr           TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. audit_logs ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  timestamp    TEXT,
  action       TEXT NOT NULL,
  performed_by TEXT,
  role         TEXT,
  details      TEXT,
  ip_address   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 7. testimonials ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  role                TEXT,
  city                TEXT,
  quote               TEXT NOT NULL,
  avatar              TEXT,
  campaign_title      TEXT,
  amount_received_inr INT,
  video_thumbnail     TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 8. community_stories ────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_stories (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  category       TEXT,
  location       TEXT,
  date           TEXT,
  image          TEXT,
  summary        TEXT,
  impact_metric  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 9. gallery_photos ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery_photos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  city       TEXT,
  image      TEXT NOT NULL,
  category   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 10. contact_messages ────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  message    TEXT NOT NULL,
  status     TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 11. newsletter_subscribers ──────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 12. emergency_aid_requests ──────────────────────────────
CREATE TABLE IF NOT EXISTS emergency_aid_requests (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id            TEXT REFERENCES users(id),
  member_name          TEXT NOT NULL,
  community_id         TEXT REFERENCES communities(id),
  community_name       TEXT,
  aid_category         TEXT NOT NULL,
  estimated_amount_inr INT  NOT NULL,
  description          TEXT NOT NULL,
  hospital_details     TEXT,
  status               TEXT DEFAULT 'pending',
  reviewed_by          TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 13. announcements ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id   TEXT REFERENCES communities(id),
  community_name TEXT,
  sent_by        TEXT NOT NULL,
  message        TEXT NOT NULL,
  channel        TEXT DEFAULT 'both',
  sent_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 14. user_badges ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id           TEXT REFERENCES users(id),
  badge_name        TEXT NOT NULL,
  badge_description TEXT,
  badge_type        TEXT DEFAULT 'emerald',
  awarded_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 15. monthly_donation_stats ──────────────────────────────
CREATE TABLE IF NOT EXISTS monthly_donation_stats (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT REFERENCES users(id),
  month      TEXT NOT NULL,
  year       INT  NOT NULL,
  amount_inr INT  DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Communities
INSERT INTO communities (id, name, city, state, admin_name, admin_role_title, avatar, total_members, active_campaigns, total_raised_inr, health_score, verified_status, description, established_year, cover_image) VALUES
('comm_bareilly_hq',       'Bareilly Central Care Society (Headquarters)', 'Bareilly',   'Uttar Pradesh', 'Maulana Hafiz Ziauddin Bareillvi', 'Headquarters Administrator', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', 3450, 12, 9850000,  99, 'Verified', 'Headquarters of SevaSangam in Civil Lines, Bareilly. Managing emergency Janazah mortuary van, Nikah bridal kits, and student scholarships across Uttar Pradesh.', 2017, 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'),
('comm_bareilly_rohilkhand','Rohilkhand Educational & Nikah Trust',         'Bareilly',   'Uttar Pradesh', 'Dr. Shakeel Ahmad Usmani',         'Community Administrator',    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 1820,  5, 4120000,  97, 'Verified', 'Serving Qutubkhana and Rohilkhand University area through collective Nikah assistance, widow pensions, and orphan schooling.',                                           2019, 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80'),
('comm_lko_chowk',         'Chowk Heritage Community Foundation',           'Lucknow',    'Uttar Pradesh', 'Syed Tariq Husain',                'Community Administrator',    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 1190,  4, 3290000,  95, 'Verified', 'Focusing on girl-child higher education, artisan medical aid, and emergency heart surgeries in Lucknow & Central UP.',                                                    2020, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'),
('comm_delhi_central',     'Hazrat Nizamuddin Welfare Community',           'Delhi',      'Delhi NCR',     'Maulana Salman Farooqui',          'Community Administrator',    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 1240,  6, 4250000,  98, 'Verified', 'Providing medical, educational, and monthly food kit assistance to lower-income North Indian families in Central Delhi.',                                                  2018, 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80'),
('comm_bareilly_izatnagar', 'Izatnagar & CB Ganj Care Society',             'Bareilly',   'Uttar Pradesh', 'Alhaj Mohammad Yusuf',             'Community Administrator',    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',  980,  4, 2150000,  94, 'Verified', 'Operating free ambulance transfers, winter clothing drives, and skill development for youth in Izatnagar & CB Ganj Bareilly.',                                              2021, 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- Users (1 seeded user for each of the 4 distinct roles)
INSERT INTO users (id, name, email, phone, role, avatar, community_id, community_name, membership_id, is_verified, is_premium, join_date, city, state, total_donated_inr, donations_count, life_impact_score, families_helped, hasanat_counter, giving_streak_months, community_rank) VALUES
('usr_super_admin',     'Maulana Hafiz Ziauddin',      'superadmin@sevasangam.org',     '+91 99000 00001', 'super_admin',     'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', 'comm_bareilly_hq',       'Bareilly Central Care Society (Headquarters)', 'SS-HQ-SUPER-0001',  TRUE,  TRUE,  '01 Jan 2023', 'Bareilly',  'Uttar Pradesh', 500000, 120, 99, 50, 25000, 24, 1),
('usr_executive_admin', 'Farhan Ali Siddiqui',        'executive@sevasangam.org',      '+91 99000 00002', 'executive',       'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'comm_bareilly_hq',       'Bareilly Central Care Society (Headquarters)', 'SS-HQ-EXEC-0002',   TRUE,  FALSE, '15 Feb 2023', 'Bareilly',  'Uttar Pradesh',  45000,  22, NULL, NULL, NULL, NULL, NULL),
('usr_community_admin', 'Dr. Shakeel Ahmad Usmani',   'communityadmin@sevasangam.org',  '+91 99000 00003', 'community_admin', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'comm_bareilly_rohilkhand','Rohilkhand Educational & Nikah Trust',     'SS-BLY-COMM-0003',  TRUE,  FALSE, '10 Mar 2023', 'Bareilly',  'Uttar Pradesh',  35000,  18, NULL, NULL, NULL, NULL, NULL),
('usr_member',          'Aarif Khan',                  'member@sevasangam.org',          '+91 99000 00004', 'member',          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'comm_delhi_central',     'Hazrat Nizamuddin Welfare Community',      'SS-DEL-MEM-0004',   TRUE,  FALSE, '12 Jan 2024', 'Delhi',     'Delhi NCR',      12500,  14, NULL, NULL, NULL, NULL, NULL),
('usr_prem_202',        'Ayesha Fatima',                             'ayesha.fatima@example.com',     '+91 98112 33445', 'premium_donor',   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'comm_bareilly_rohilkhand','Rohilkhand Educational & Nikah Trust',     'SS-HYD-PREM-0012',  TRUE,  TRUE,  '04 Mar 2023', 'Hyderabad', 'Telangana',     185000,  48, 94,   38, 14850, 18,   3)
ON CONFLICT (id) DO NOTHING;

-- Campaigns
INSERT INTO campaigns (id, title, slug, category, community_id, community_name, city, beneficiary_name, beneficiary_relation, goal_inr, raised_inr, donors_count, days_left, is_verified, is_zakat_eligible, is_urgent, is_premium_featured, main_image, story, documents, verification_timeline, need_breakdown, created_date, status) VALUES
('camp_med_01',  'Urgent Kidney Transplant for 8-Year-Old Zoya in AIIMS Delhi',           'kidney-transplant-zoya-aiims',              'Medical',   'comm_delhi_central',      'Hazrat Nizamuddin Welfare Community',  'Delhi',     'Zoya Siddiqui (8 yrs)',          'Father: Imran Siddiqui (Daily wage carpenter)', 450000, 320000, 184,  8, TRUE, TRUE,  TRUE,  TRUE,  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80', 'Little Zoya was diagnosed with end-stage renal disease 4 months ago. Her father works as a local daily-wage wood craftsman and has exhausted all savings on weekly dialysis.', '[{"title":"AIIMS Medical Prescription & Estimate","url":"#","verifiedBy":"Executive Team"},{"title":"Aadhaar Card & Income Certificate","url":"#","verifiedBy":"Community Admin"}]', '[{"step":"Beneficiary Identity Verification","date":"10 Jul 2024","status":"completed"},{"step":"Medical Hospital On-site Verification","date":"12 Jul 2024","status":"completed"},{"step":"Executive Committee Approval","date":"14 Jul 2024","status":"completed"},{"step":"Campaign Live & Direct Bank Escrow Active","date":"15 Jul 2024","status":"completed"}]', '[{"item":"Surgery & Operation Theatre Charges","amountINR":220000},{"item":"ICU Stay & Monitoring (10 Days)","amountINR":110000},{"item":"Post-transplant Immunosuppressant Medications","amountINR":80000},{"item":"Blood Transfusion & Pre-op Testing","amountINR":40000}]', '15 Jul 2024', 'active'),
('camp_edu_02',  'Higher Education Scholarship Fund for 15 Orphan Girls in Bareilly',      'orphan-girls-higher-education-bareilly',    'Education', 'comm_bareilly_rohilkhand','Bareilly Unity & Relief Council',      'Bareilly',  '15 Student Scholars',            'Care of Bareilly Orphan Care Trust',            300000, 215000,  96, 14, TRUE, TRUE,  FALSE, TRUE,  'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80', '15 bright young girls who cleared their Class 12 exams with top honors (above 85%) lack the financial means to pay college admission fees.',                                   '[{"title":"Mark Sheets & College Admission Letters","url":"#","verifiedBy":"Executive Team"}]',                                                                               '[{"step":"Academic Verification","date":"01 Jun 2024","status":"completed"},{"step":"College Fee Structure Clearance","date":"05 Jun 2024","status":"completed"},{"step":"Executive Approval","date":"10 Jun 2024","status":"completed"}]',                                                                                                                                  '[{"item":"College Admission & Semester Fees (15 students)","amountINR":210000},{"item":"Books, Uniforms & Study Kit","amountINR":60000},{"item":"Transport Stipend","amountINR":30000}]',                                                                                              '10 Jun 2024', 'active'),
('camp_marr_03', 'Simple Dignified Marriage Support for Orphan Bride Sania in Lucknow',    'marriage-support-sania-lucknow',            'Marriage',  'comm_lko_chowk',          'Chowk Heritage Community Foundation',  'Lucknow',   'Sania Parveen (21 yrs)',          'Mother: Rashida Begum (Widow)',                  120000,  98000,  64,  5, TRUE, TRUE,  TRUE,  FALSE, 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80', 'Sania lost her father 6 years ago. Her widowed mother works hard stitching clothes to feed her family.',                                                                       '[{"title":"Nikah Registration Card & Invitation","url":"#","verifiedBy":"Community Admin"}]',                                                                                  '[{"step":"Local Verification & Community Visit","date":"18 Jul 2024","status":"completed"},{"step":"Executive Approval","date":"20 Jul 2024","status":"completed"}]',                                                                                                                                                                                                         '[{"item":"Basic Household Essentials & Sewing Machine Gift","amountINR":75000},{"item":"Simple Meal & Venue Arrangement for 40 Guests","amountINR":35000},{"item":"Administrative & Transport","amountINR":10000}]',                                                                   '20 Jul 2024', 'active'),
('camp_food_04', 'Monthly Ration Kits for 200 Flood Affected Families in Hyderabad',       'monthly-ration-kits-hyderabad',             'Food',      'comm_bareilly_rohilkhand','Charminar Heritage & Care Society',    'Hyderabad', '200 Lower-income Families',       'Old City Flood Relief Drive',                    500000, 410000, 230, 12, TRUE, TRUE,  TRUE,  TRUE,  'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80', 'Heavy monsoon rains flooded low-lying streets in Hyderabad, damaging food stocks and homes of informal daily wage workers.',                                                   '[{"title":"Beneficiary List & Token Verification","url":"#","verifiedBy":"Community Admin"}]',                                                                                 '[{"step":"Survey of Affected Households","date":"02 Jul 2024","status":"completed"},{"step":"Ration Vendor Selection","date":"05 Jul 2024","status":"completed"}]',                                                                                                                                                                                                            '[{"item":"200 Ration Grocery Bags @ ₹2200 per bag","amountINR":440000},{"item":"Packing & Transportation Logistics","amountINR":60000}]',                                                                                                                                             '05 Jul 2024', 'active'),
('camp_jan_07',  'Janazah Funeral Emergency Fund & Cemetery Ambulance Support',             'janazah-emergency-funeral-fund',            'Janazah',   'comm_lko_chowk',          'Chowk Heritage Community Foundation',  'Lucknow',   'Destitute & Unclaimed Janazah Service','Community Welfare Services',                  150000, 112000,  88, 18, TRUE, TRUE,  TRUE,  FALSE, 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80', 'Ensuring dignified final rites, Kafan burial cloth, mortuary van transportation, and cemetery grave preparation for impoverished families.',                                   '[{"title":"Community Funeral Welfare Audit Report","url":"#","verifiedBy":"Executive Team"}]',                                                                                 '[{"step":"Cemetery Committee Authorization","date":"01 Jul 2024","status":"completed"}]',                                                                                                                                                                                                                                                                                     '[{"item":"Kafan, Ghusl & Burial Materials (20 services)","amountINR":70000},{"item":"Mortuary Van Maintenance & Fuel","amountINR":50000},{"item":"Grave Digging Labor Support","amountINR":30000}]',                                                                                   '01 Jul 2024', 'active'),
('camp_jan_08',  'Free Mortuary Van & Cold Storage Unit for Needy Families in Old City',   'free-mortuary-van-hyderabad',               'Janazah',   'comm_bareilly_rohilkhand','Charminar Heritage & Care Society',    'Hyderabad', 'Free Ambulance & Janazah Ambulance Service','Community Emergency Service',             280000, 215000, 142, 10, TRUE, TRUE,  TRUE,  TRUE,  'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=800&q=80', 'Providing 24/7 free mortuary ambulance transport and portable freezer box services for bereaved underprivileged families.',                                                     '[{"title":"Ambulance Purchase Quotation & RTO License","url":"#","verifiedBy":"Executive Team"}]',                                                                             '[{"step":"Community Admin On-site Audit","date":"10 Jun 2024","status":"completed"}]',                                                                                                                                                                                                                                                                                        '[{"item":"2x Portable Dead Body Cold Freezer Boxes","amountINR":120000},{"item":"Ambulance Fuel & Maintenance Escrow (6 Months)","amountINR":110000},{"item":"Kafan & Ghusl Emergency Stock","amountINR":50000}]',                                                                      '10 Jun 2024', 'active'),
('camp_mar_10',  'Bridal Household Starter Kit & Nikah Support for Orphan Bride Shabana',  'bridal-starter-kit-shabana',                'Marriage',  'comm_delhi_central',      'Hazrat Nizamuddin Welfare Community',  'Delhi',     'Shabana Khatoon (21 yrs)',        'Orphan bride raised by grandmother',             110000,  88000,  64,  7, TRUE, TRUE,  TRUE,  TRUE,  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', 'Shabana lost both parents during childhood and is raised by her elderly grandmother. We are organizing basic kitchen appliances, bedding, clothing.',                           '[{"title":"Orphan Certificate & Marriage Card","url":"#","verifiedBy":"Community Admin"}]',                                                                                     '[{"step":"Home Visit & Verification","date":"01 Jul 2024","status":"completed"}]',                                                                                                                                                                                                                                                                                            '[{"item":"Utensils, Bedding & Basic Home Appliances","amountINR":65000},{"item":"Nikah Clothes & Bridal Trunk","amountINR":25000},{"item":"Walima / Meal for Close Relatives (30 guests)","amountINR":20000}]',                                                                         '01 Jul 2024', 'active'),
('camp_mar_11',  'Mass Community Nikah Program for 5 Low-Income Daughters in Bareilly',    'community-nikah-bareilly',                  'Marriage',  'comm_bareilly_rohilkhand','Rohilkhand Educational & Welfare Trust','Bareilly',  '5 Low-income Brides',            'Joint Community Marriage Drive',                 350000, 290000, 180, 15, TRUE, TRUE,  FALSE, TRUE,  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', 'Organizing a collective, dignified, dowry-free mass wedding for 5 destitute brides in Bareilly. Every bride receives a new sewing machine, cookware, bed set.',                '[{"title":"Mass Nikah Committee Approval","url":"#","verifiedBy":"Executive Team"}]',                                                                                          '[{"step":"Family Background Verification","date":"12 May 2024","status":"completed"}]',                                                                                                                                                                                                                                                                                       '[{"item":"5 Bridal Gifts & Sewing Machine Kits","amountINR":200000},{"item":"Community Hall & Simple Food Catering","amountINR":100000},{"item":"Marriage Registration Fees","amountINR":50000}]',                                                                                     '12 May 2024', 'active')
ON CONFLICT (id) DO NOTHING;

-- Donations
INSERT INTO donations (id, transaction_id, utr_number, donor_name, donor_id, donor_role, campaign_id, campaign_title, community_name, amount_inr, category, is_outside_community, payment_method, status, date, receipt_number) VALUES
('don_801', 'TXN998241029', '420199381029', 'Rahul Sharma',    'usr_mem_101',  'member',        'camp_med_01',  'Urgent Kidney Transplant for 8-Year-Old Zoya in AIIMS Delhi',          'Hazrat Nizamuddin Welfare Community', 2500,  'Zakat',   FALSE, 'UPI',          'verified', '28 Jul 2024, 02:45 PM', 'RCP-2024-0982'),
('don_802', 'TXN998241030', '420199381030', 'Ayesha Fatima',   'usr_prem_202', 'premium_donor', 'camp_edu_02',  'Higher Education Scholarship Fund for 15 Orphan Girls',               'Bareilly Unity & Relief Council',     10000, 'Sadakah', TRUE,  'UPI',          'verified', '27 Jul 2024, 11:15 AM', 'RCP-2024-0983'),
('don_803', 'TXN998241031', '420199381031', 'Sneha Gupta',     'usr_mem_103',  'member',        'camp_food_04', 'Monthly Ration Kits for 200 Flood Affected Families',                  'Charminar Heritage & Care Society',   1000,  'General', TRUE,  'QR Code',      'verified', '26 Jul 2024, 06:20 PM', 'RCP-2024-0984'),
('don_804', 'TXN998241032', '420199381032', 'Mohammed Sameer', 'usr_mem_104',  'member',        'camp_marr_03', 'Simple Dignified Marriage Support for Orphan Bride Sania',             'Chowk Heritage Community Foundation', 5000,  'Zakat',   FALSE, 'Bank Transfer','verified', '25 Jul 2024, 10:05 AM', 'RCP-2024-0985'),
('don_805', 'TXN998241033', '420199381033', 'Aarif Khan',      'usr_mem_101',  'member',        'camp_med_01',  'Urgent Kidney Transplant for 8-Year-Old Zoya in AIIMS Delhi',          'Hazrat Nizamuddin Welfare Community', 1500,  'Medical', FALSE, 'UPI',          'verified', '24 Jul 2024, 04:30 PM', 'RCP-2024-0986')
ON CONFLICT (id) DO NOTHING;

-- Pending Verifications
INSERT INTO pending_verifications (id, type, title, submitted_by, date, status, details, document_url, amount_inr, utr) VALUES
('ver_kyc_01',  'kyc',         'New Member Membership Verification - Bareilly Community',   'Vikram Malhotra (+91 98123 77665)',    '29 Jul 2024, 04:12 PM', 'pending', 'Aadhaar ID matched. Paid ₹50 membership fee. Pending Executive signature.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', NULL,   NULL),
('ver_camp_02', 'campaign',    'New Medical Campaign: Heart Valve Surgery for 12yo Ananya', 'Dr. Mohammed Ahmed (Community Admin)', '29 Jul 2024, 02:00 PM', 'pending', 'Requested ₹3.2 Lakhs goal. Hospital estimation document attached.',          'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80', 320000, NULL),
('ver_utr_03',  'payment_utr', 'UPI Payment Screenshot Review - ₹5,000 Zakat',             'Priya Singh (Member)',                '29 Jul 2024, 05:30 PM', 'pending', 'UTR: 420911882310 - Target: Kidney Transplant Zoya',                        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=300&q=80', 5000,   '420911882310')
ON CONFLICT (id) DO NOTHING;

-- Audit Logs
INSERT INTO audit_logs (id, timestamp, action, performed_by, role, details, ip_address) VALUES
('log_01', '29 Jul 2024 05:45 PM', 'Campaign Approved',           'Executive Team (Farhan Ali)',          'executive',  'Verified AIIMS Hospital estimate for Campaign #camp_med_01. Escrow enabled.', '103.22.45.12'),
('log_02', '29 Jul 2024 03:20 PM', 'KYC Verified & Receipt Issued','Executive Team (Farhan Ali)',          'executive',  'Verified Aadhaar KYC for Member #SS-DEL-2024-8842.',                        '103.22.45.12'),
('log_03', '28 Jul 2024 10:10 AM', 'New Community Provisioned',   'Super Admin (System Administrator)',   'super_admin','Approved new community: Kurla Progressive Community Care.',                '182.74.12.90')
ON CONFLICT (id) DO NOTHING;

-- Testimonials
INSERT INTO testimonials (id, name, role, city, quote, avatar, campaign_title, amount_received_inr) VALUES
('test_01', 'Imran Siddiqui',     'Beneficiary Father', 'Delhi',     'When my daughter Zoya needed an emergency kidney transplant, our local SevaSangam community raised ₹3.2 Lakhs in under two weeks. The transparency and direct hospital payments gave us hope.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 'Urgent Kidney Transplant for Zoya',          320000),
('test_02', 'Rashida Begum',       'Widow Mother',       'Lucknow',   'As a single mother working on daily stitching wages, I could never have arranged my daughter Sania''s wedding essentials without the community''s ₹50 membership solidarity.',                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', 'Marriage Support for Orphan Bride Sania',    98000),
('test_03', 'Dr. Mohammed Ahmed',  'Community Admin',    'Hyderabad', 'Managing 2,000+ local families through SevaSangam has completely eliminated fraud. Every rupee donated inside or outside our community is tracked with clear UTR receipts.',                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', NULL,                                         NULL)
ON CONFLICT (id) DO NOTHING;

-- Community Stories
INSERT INTO community_stories (id, title, category, location, date, image, summary, impact_metric) VALUES
('story_01', 'How 1,200 Delhi Families Provided 3,000 Fresh Warm Meals During Cold Waves',   'Emergency Relief', 'Nizamuddin, Delhi',      '15 Jan 2024', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80', 'A 10-day emergency drive mobilized local volunteers to serve hot nutritious food and distribute woolens to homeless elderly residents.',                    '3,000 Hot Meals & 500 Blankets'),
('story_02', 'Zero Drop-out Rate: Bareilly Girls Achieve 100% High School Graduation',        'Education',        'Bareilly, Uttar Pradesh','02 Apr 2024', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80', 'Through micro-sponsorships of ₹50/month per member, 45 young girls completed their secondary school education and enrolled in degree colleges.', '45 Girls Higher Enrolled')
ON CONFLICT (id) DO NOTHING;

-- Gallery Photos
INSERT INTO gallery_photos (title, city, image, category) VALUES
('Dignified Nikah Essentials & Bridal Trunk Drive - Qutubkhana, Bareilly (UP)',          'Bareilly',  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80', 'Nikah Support'),
('Schooling Kit & Book Distribution for Orphan Girls - Bareilly (UP)',                   'Bareilly',  'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80', 'Child Education'),
('Emergency Medical & Dialysis Consultation Drive - Bareilly District Hospital',          'Bareilly',  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80', 'Medical Aid'),
('Monthly Food Grocery Ration Kits Distribution - CB Ganj, Bareilly',                    'Bareilly',  'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80', 'Food Relief'),
('Bareilly District Qabristan Maintenance & Free Janazah Mortuary Van Service',           'Bareilly',  'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80', 'Janazah & Qabristan'),
('Collective Dowry-Free Nikah Ceremony Drive - Rohilkhand, Bareilly',                    'Bareilly',  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80', 'Mass Nikah Support');

-- User Badges (for premium donor)
INSERT INTO user_badges (user_id, badge_name, badge_description, badge_type) VALUES
('usr_prem_202', 'Grand Patron Award 2024',  'Contributed over ₹1.5 Lakhs in a year',        'gold'),
('usr_prem_202', 'Lifesaver Medical Shield', 'Funded 3 emergency heart/kidney surgeries',     'emerald'),
('usr_prem_202', 'Education Guardian',       'Sponsored higher studies for 8 orphan girls',   'blue');

-- Monthly Donation Stats (for premium donor chart)
INSERT INTO monthly_donation_stats (user_id, month, year, amount_inr) VALUES
('usr_prem_202', 'Jan', 2024, 15000),
('usr_prem_202', 'Feb', 2024, 18000),
('usr_prem_202', 'Mar', 2024, 12000),
('usr_prem_202', 'Apr', 2024, 25000),
('usr_prem_202', 'May', 2024, 30000),
('usr_prem_202', 'Jun', 2024, 40000),
('usr_prem_202', 'Jul', 2024, 45000);

-- ============================================================
-- Enable Row Level Security (RLS) — public read on main tables
-- ============================================================
ALTER TABLE communities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns           ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials        ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_stories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges         ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_donation_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_aid_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements       ENABLE ROW LEVEL SECURITY;

-- ─── Policies (Drop if exists first for safe re-runs) ─────────
DROP POLICY IF EXISTS "Public read communities"       ON communities;
DROP POLICY IF EXISTS "Public read campaigns"         ON campaigns;
DROP POLICY IF EXISTS "Public read testimonials"      ON testimonials;
DROP POLICY IF EXISTS "Public read stories"           ON community_stories;
DROP POLICY IF EXISTS "Public read gallery"           ON gallery_photos;
DROP POLICY IF EXISTS "Public read donations"         ON donations;
DROP POLICY IF EXISTS "Public read audit_logs"        ON audit_logs;
DROP POLICY IF EXISTS "Public read user_badges"       ON user_badges;
DROP POLICY IF EXISTS "Public read monthly_stats"     ON monthly_donation_stats;

DROP POLICY IF EXISTS "Anyone can insert contact"     ON contact_messages;
DROP POLICY IF EXISTS "Anyone can subscribe"          ON newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can insert donation"    ON donations;
DROP POLICY IF EXISTS "Anyone can insert user"        ON users;
DROP POLICY IF EXISTS "Anyone can read users"         ON users;
DROP POLICY IF EXISTS "Anyone can insert aid request" ON emergency_aid_requests;
DROP POLICY IF EXISTS "Anyone can insert campaign"    ON campaigns;
DROP POLICY IF EXISTS "Anyone can update campaign"    ON campaigns;
DROP POLICY IF EXISTS "Anyone can read verifications" ON pending_verifications;
DROP POLICY IF EXISTS "Anyone can update verification" ON pending_verifications;
DROP POLICY IF EXISTS "Anyone can insert audit_log"   ON audit_logs;
DROP POLICY IF EXISTS "Anyone can insert announcement" ON announcements;

DROP POLICY IF EXISTS "Anyone can insert gallery"     ON gallery_photos;
DROP POLICY IF EXISTS "Anyone can update gallery"     ON gallery_photos;
DROP POLICY IF EXISTS "Anyone can delete gallery"     ON gallery_photos;

-- Insert policies (anon users can submit forms)
CREATE POLICY "Public read communities"       ON communities          FOR SELECT USING (true);
CREATE POLICY "Public read campaigns"         ON campaigns            FOR SELECT USING (true);
CREATE POLICY "Public read testimonials"      ON testimonials         FOR SELECT USING (true);
CREATE POLICY "Public read stories"           ON community_stories    FOR SELECT USING (true);
CREATE POLICY "Public read gallery"           ON gallery_photos       FOR SELECT USING (true);
CREATE POLICY "Public read donations"         ON donations            FOR SELECT USING (true);
CREATE POLICY "Public read audit_logs"        ON audit_logs           FOR SELECT USING (true);
CREATE POLICY "Public read user_badges"       ON user_badges          FOR SELECT USING (true);
CREATE POLICY "Public read monthly_stats"     ON monthly_donation_stats FOR SELECT USING (true);

-- Insert policies (anon users can submit forms)
CREATE POLICY "Anyone can insert contact"     ON contact_messages     FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can subscribe"          ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert donation"    ON donations            FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert user"        ON users                FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read users"         ON users                FOR SELECT USING (true);
CREATE POLICY "Anyone can insert aid request" ON emergency_aid_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert campaign"    ON campaigns            FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update campaign"    ON campaigns            FOR UPDATE USING (true);
CREATE POLICY "Anyone can read verifications" ON pending_verifications FOR SELECT USING (true);
CREATE POLICY "Anyone can update verification" ON pending_verifications FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert audit_log"   ON audit_logs           FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert announcement" ON announcements       FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert gallery"     ON gallery_photos       FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update gallery"     ON gallery_photos       FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete gallery"     ON gallery_photos       FOR DELETE USING (true);

-- ─── Table Privileges ──────────────────────────────────────────
-- Grant full table permissions to anon & authenticated API roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donations TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_photos TO anon, authenticated, service_role;



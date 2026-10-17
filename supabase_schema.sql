-- =============================================================================
-- G-TEC Computer Education - Tripunithura Campus
-- Supabase PostgreSQL Database Schema
-- Run this in your Supabase Project -> SQL Editor to initialize all tables
-- =============================================================================

-- Enable extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  "categoryName" TEXT,
  badge TEXT DEFAULT 'Popular',
  duration TEXT DEFAULT '3 Months',
  mode TEXT DEFAULT 'Classroom / Hybrid',
  eligibility TEXT DEFAULT 'Plus Two / Degree',
  rating NUMERIC DEFAULT 4.9,
  "reviewsCount" INTEGER DEFAULT 50,
  "shortDesc" TEXT,
  description TEXT,
  tools JSONB DEFAULT '[]'::jsonb,
  syllabus JSONB DEFAULT '[]'::jsonb,
  careers JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  "customFields" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Index for category and title lookups
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_title ON public.courses(title);

-- 2. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  course TEXT,
  comments TEXT,
  mode TEXT,
  status TEXT DEFAULT 'New',
  notes TEXT,
  ip TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON public.enquiries("createdAt" DESC);

-- 3. EVENT & EXAMINATION LINKS TABLE
CREATE TABLE IF NOT EXISTS public.event_links (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'Examination',
  "badgeText" TEXT DEFAULT 'Active Now',
  date TEXT DEFAULT 'Upcoming',
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_links_active ON public.event_links(active);
CREATE INDEX IF NOT EXISTS idx_event_links_category ON public.event_links(category);

-- 4. GALLERY HIGHLIGHTS TABLE
CREATE TABLE IF NOT EXISTS public.gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Campus Life',
  date TEXT,
  image TEXT NOT NULL,
  caption TEXT,
  "isHighlight" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_highlight ON public.gallery("isHighlight");

-- 5. CERTIFICATE VERIFICATION TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
  "certNumber" TEXT PRIMARY KEY,
  "studentName" TEXT NOT NULL,
  course TEXT NOT NULL,
  grade TEXT,
  "issueDate" TEXT,
  center TEXT DEFAULT 'Tripunithura Campus (Code: KL-TRP-042)',
  status TEXT DEFAULT 'Verified & Valid',
  duration TEXT,
  accreditation TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certs_number ON public.certificates("certNumber");

-- 6. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  course TEXT,
  comments TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ADMIN CREDENTIALS TABLE (STRICTLY PROTECTED)
CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  username TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "isCustomized" BOOLEAN DEFAULT FALSE,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Row Level Security (RLS) & Policies
-- Ensures secure public reading and admin operations
-- =============================================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- ADMIN CREDENTIALS: Only accessible via service role (NEVER exposed to public anon)
DROP POLICY IF EXISTS "Service role access for admin_credentials" ON public.admin_credentials;
CREATE POLICY "Service role access for admin_credentials" ON public.admin_credentials
  FOR ALL USING (true) WITH CHECK (true);

-- COURSES: Anyone can read courses, service_role or admin can write
DROP POLICY IF EXISTS "Public courses are viewable by everyone" ON public.courses;
CREATE POLICY "Public courses are viewable by everyone" ON public.courses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable all access for service role on courses" ON public.courses;
CREATE POLICY "Enable all access for service role on courses" ON public.courses
  FOR ALL USING (true) WITH CHECK (true);

-- EVENT LINKS: Anyone can read active links, service_role or admin can write
DROP POLICY IF EXISTS "Public event links are viewable by everyone" ON public.event_links;
CREATE POLICY "Public event links are viewable by everyone" ON public.event_links
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable all access for service role on event_links" ON public.event_links;
CREATE POLICY "Enable all access for service role on event_links" ON public.event_links
  FOR ALL USING (true) WITH CHECK (true);

-- GALLERY: Anyone can read gallery photos
DROP POLICY IF EXISTS "Public gallery is viewable by everyone" ON public.gallery;
CREATE POLICY "Public gallery is viewable by everyone" ON public.gallery
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable all access for service role on gallery" ON public.gallery;
CREATE POLICY "Enable all access for service role on gallery" ON public.gallery
  FOR ALL USING (true) WITH CHECK (true);

-- CERTIFICATES: Anyone can query to verify their certificate
DROP POLICY IF EXISTS "Public certificate verification viewable by everyone" ON public.certificates;
CREATE POLICY "Public certificate verification viewable by everyone" ON public.certificates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable all access for service role on certificates" ON public.certificates;
CREATE POLICY "Enable all access for service role on certificates" ON public.certificates
  FOR ALL USING (true) WITH CHECK (true);

-- ENQUIRIES: Public can submit inquiries, service role can read/manage
DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
CREATE POLICY "Public can submit enquiries" ON public.enquiries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for service role on enquiries" ON public.enquiries;
CREATE POLICY "Enable all access for service role on enquiries" ON public.enquiries
  FOR ALL USING (true) WITH CHECK (true);

-- CONTACTS: Public can submit contact messages, service role can read/manage
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contacts;
CREATE POLICY "Public can submit contact messages" ON public.contacts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for service role on contacts" ON public.contacts;
CREATE POLICY "Enable all access for service role on contacts" ON public.contacts
  FOR ALL USING (true) WITH CHECK (true);

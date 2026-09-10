-- =========================================================================
-- SAHAYAK (सहायक) - SUPABASE REALTIME RESET & DEMO QUEUE PURGE
-- Smart India Hackathon 2026
-- =========================================================================

-- ------------------------------------------------------------------------
-- FIX 1: HARD-RESET SUPABASE REALTIME PUBLICATION
-- ------------------------------------------------------------------------

-- 1. Ensure scheme_applications is in the real-time publication
-- Direct command:
ALTER PUBLICATION supabase_realtime ADD TABLE scheme_applications;

-- 2. Configure Replica Identity to FULL
-- Ensures PostgreSQL delivers full record snapshots on UPDATE & DELETE CDC events
ALTER TABLE public.scheme_applications REPLICA IDENTITY FULL;

-- 3. Ensure Row Level Security (RLS) is disabled for testing/CDC broadcast
-- (Prevents anonymous realtime websocket subscriptions from being filtered)
ALTER TABLE public.scheme_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizens DISABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------
-- FIX 2: CLEAR PRE-EXISTING DEMO FORMS
-- ------------------------------------------------------------------------

-- Safely purge all rows in the verification queue.
-- NOTE:
-- - This does NOT drop the 'scheme_applications' table.
-- - This does NOT touch or drop the 'citizens' table.
-- - Newly added columns in citizens (father_name, contact_number) remain 100% intact.
TRUNCATE TABLE scheme_applications CASCADE;

-- ------------------------------------------------------------------------
-- VERIFICATION QUERY
-- ------------------------------------------------------------------------
-- Verify that the queue is empty:
SELECT COUNT(*) AS remaining_applications FROM public.scheme_applications;

-- Verify that citizens demographic table and columns are intact:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'citizens' 
  AND column_name IN ('name', 'father_name', 'contact_number', 'aadhaar_masked', 'category');

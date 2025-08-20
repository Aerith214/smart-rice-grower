-- CRITICAL SECURITY FIX: Remove vulnerable users table
-- This table stores plaintext passwords and has overly permissive RLS policies
-- The application should use Supabase Auth instead

DROP TABLE IF EXISTS public.users CASCADE;

-- Remove any functions that might reference the old users table
-- (None found in current schema, but this ensures cleanup)
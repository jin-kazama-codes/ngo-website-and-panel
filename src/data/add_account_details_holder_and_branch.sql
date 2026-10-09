-- Migration: Add account_holder_name and branch_name columns to account_details table
-- Run this in your Supabase SQL Editor if needed (Dashboard -> SQL Editor -> New query)

ALTER TABLE public.account_details ADD COLUMN IF NOT EXISTS account_holder_name text;
ALTER TABLE public.account_details ADD COLUMN IF NOT EXISTS branch_name text;

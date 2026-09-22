-- Migration: Add rejection_reason column to donations table
-- Run this in your Supabase SQL Editor if needed (Dashboard -> SQL Editor -> New query)

ALTER TABLE donations ADD COLUMN IF NOT EXISTS rejection_reason text;

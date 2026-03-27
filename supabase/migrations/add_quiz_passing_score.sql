-- Migration: Add passing_score to quizzes and description/time_estimated_minutes to lessons
-- Run this in the Supabase SQL editor

ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS passing_score INT DEFAULT 60;

-- Also add time_estimated_minutes and description to lessons if not present
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS time_estimated_minutes INT DEFAULT 0;

-- Drop the leaky RLS policy for quiz_questions (if it was already applied)
DROP POLICY IF EXISTS "Students view questions for published quizzes" ON public.quiz_questions;

-- Ensure XP total is tracked on profiles (already exists as xp_total)
-- The quiz action uses xp_total not xp, this is correct

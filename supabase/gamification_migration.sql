-- =====================================================
-- GAMIFICATION SYSTEM SQL MIGRATION
-- Run this in Supabase Dashboard -> SQL Editor
-- =====================================================

-- 1. Create trigger to auto-update profiles.xp_total when xp_transactions change
CREATE OR REPLACE FUNCTION update_xp_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET xp_total = COALESCE((
    SELECT SUM(amount) FROM xp_transactions WHERE student_id = NEW.student_id
  ), 0)
  WHERE id = NEW.student_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_xp_total ON xp_transactions;
CREATE TRIGGER trg_update_xp_total
AFTER INSERT OR UPDATE OR DELETE ON xp_transactions
FOR EACH ROW EXECUTE FUNCTION update_xp_total();

-- 2. Seed the 8 badges (idempotent: clear existing first)
DELETE FROM student_badges;
DELETE FROM badges;

INSERT INTO badges (id, name, description, icon_url, condition_type, condition_value) VALUES
  (gen_random_uuid(), 'First Steps', 'Complete your first lesson', '🌟', 'lessons_completed', 1),
  (gen_random_uuid(), 'Perfect Score', 'Score 100% on any quiz', '💯', 'perfect_quiz', 1),
  (gen_random_uuid(), 'On Fire', '7-day attendance streak', '🔥', 'attendance_streak', 7),
  (gen_random_uuid(), 'Quiz Champion', 'Pass 10 quizzes', '🥇', 'quizzes_passed', 10),
  (gen_random_uuid(), 'Knowledge Seeker', 'Complete 20 lessons', '📚', 'lessons_completed', 20),
  (gen_random_uuid(), 'Speed Runner', 'Complete a quiz in under 5 minutes', '⚡', 'speed_quiz', 5),
  (gen_random_uuid(), 'Team Player', 'Enroll in 3 or more classes', '🤝', 'classes_enrolled', 3),
  (gen_random_uuid(), 'Top 3', 'Rank in the top 3 on the leaderboard', '🏅', 'top3_leaderboard', 3);

-- 3. Sync existing profiles.xp_total from xp_transactions
UPDATE profiles p
SET xp_total = COALESCE((
  SELECT SUM(amount) FROM xp_transactions WHERE student_id = p.id
), 0)
WHERE p.role = 'student';

-- 4. Verify
SELECT 'Badges inserted:' as info, count(*) as count FROM badges;
SELECT 'XP Trigger:' as info, tgname, tgrelid::regclass as table_name
FROM pg_trigger WHERE tgname = 'trg_update_xp_total';

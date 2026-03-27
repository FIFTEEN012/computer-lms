-- =====================================================
-- RLS HARDENING MIGRATION
-- Run this in Supabase Dashboard -> SQL Editor
-- =====================================================

-- 1. Fix: Teachers should only manage THEIR OWN classes (not all classes)
DROP POLICY IF EXISTS "Teachers manage classes" ON public.classes;
CREATE POLICY "Teachers manage own classes" ON public.classes
  FOR ALL USING (teacher_id = auth.uid());

-- 2. Fix: Teachers should only manage enrollments in THEIR OWN classes
DROP POLICY IF EXISTS "Teachers manage enrollments" ON public.class_enrollments;
CREATE POLICY "Teachers manage own class enrollments" ON public.class_enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = class_enrollments.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- 3. Fix: Teachers should only manage lessons in THEIR OWN classes
DROP POLICY IF EXISTS "Teachers manage lessons" ON public.lessons;
CREATE POLICY "Teachers manage own class lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = lessons.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- 4. Fix: Teachers should only manage quizzes in THEIR OWN classes
DROP POLICY IF EXISTS "Teachers manage quizzes" ON public.quizzes;
CREATE POLICY "Teachers manage own class quizzes" ON public.quizzes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = quizzes.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- 5. Fix: Teachers should only manage attendance in THEIR OWN classes
DROP POLICY IF EXISTS "Teachers manage attendance" ON public.attendance;
CREATE POLICY "Teachers manage own class attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = attendance.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- 6. Fix: Teachers should only manage grades in THEIR OWN classes
DROP POLICY IF EXISTS "Teachers manage grades" ON public.grades;
CREATE POLICY "Teachers manage own class grades" ON public.grades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = grades.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- 7. Verify: All policies updated
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

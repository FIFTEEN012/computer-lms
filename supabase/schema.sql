-- Enums
CREATE TYPE user_role AS ENUM ('teacher', 'student');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

-- 1. profiles (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role user_role DEFAULT 'student',
    avatar_url TEXT,
    student_id TEXT,
    xp_total INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. classes (ห้องเรียน)
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_code TEXT UNIQUE NOT NULL,
    academic_year TEXT,
    semester INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. class_enrollments (นักเรียนในห้อง)
CREATE TABLE public.class_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- 4. lessons (บทเรียน)
CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    lesson_order INT NOT NULL,
    is_published BOOL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. lesson_progress (ความคืบหน้าบทเรียน)
CREATE TABLE public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    time_spent_seconds INT DEFAULT 0,
    UNIQUE(lesson_id, student_id)
);

-- 6. quizzes (แบบทดสอบ)
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    time_limit_minutes INT,
    max_attempts INT DEFAULT 1,
    is_published BOOL DEFAULT false
);

-- 7. quiz_questions (คำถาม)
CREATE TABLE public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type question_type NOT NULL,
    options JSONB,
    correct_answer TEXT,
    points INT DEFAULT 1,
    order_num INT NOT NULL
);

-- 8. quiz_attempts (ผลการทำ Quiz)
CREATE TABLE public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    answers JSONB,
    score DECIMAL,
    max_score INT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ
);

-- 9. attendance (การเข้าเรียน)
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status attendance_status NOT NULL,
    note TEXT,
    marked_by UUID REFERENCES public.profiles(id),
    UNIQUE(class_id, student_id, date)
);

-- 10. grades (คะแนนรวม)
CREATE TABLE public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    score DECIMAL NOT NULL,
    max_score INT NOT NULL,
    weight DECIMAL DEFAULT 1.0,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. badges (เหรียญรางวัล)
CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    condition_type TEXT,
    condition_value INT
);

-- 12. student_badges (เหรียญที่นักเรียนได้รับ)
CREATE TABLE public.student_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, badge_id)
);

-- 13. xp_transactions (คะแนน XP)
CREATE TABLE public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    reason TEXT NOT NULL,
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- Helper Function for RLS (Check if user is teacher)
CREATE OR REPLACE FUNCTION public.is_teacher() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles RLS
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Teachers can manage profiles" ON public.profiles FOR ALL USING (public.is_teacher());

-- Classes RLS: Teachers manage, students view
CREATE POLICY "Teachers manage classes" ON public.classes FOR ALL USING (public.is_teacher());
CREATE POLICY "Students view classes" ON public.classes FOR SELECT USING (auth.role() = 'authenticated');

-- Class Enrollments RLS: Teachers manage, authenticated view
CREATE POLICY "Teachers manage enrollments" ON public.class_enrollments FOR ALL USING (public.is_teacher());
CREATE POLICY "Authenticated users view enrollments" ON public.class_enrollments FOR SELECT USING (auth.role() = 'authenticated');

-- Lessons RLS: Teachers manage, students view published
CREATE POLICY "Teachers manage lessons" ON public.lessons FOR ALL USING (public.is_teacher());
CREATE POLICY "Students view published lessons" ON public.lessons FOR SELECT USING (is_published = true AND auth.role() = 'authenticated');

-- Lesson Progress RLS: Teachers view, student manages own
CREATE POLICY "Teachers view progress" ON public.lesson_progress FOR SELECT USING (public.is_teacher());
CREATE POLICY "Students manage own progress" ON public.lesson_progress FOR ALL USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Quizzes RLS: Teachers manage, students view published
CREATE POLICY "Teachers manage quizzes" ON public.quizzes FOR ALL USING (public.is_teacher());
CREATE POLICY "Students view published quizzes" ON public.quizzes FOR SELECT USING (is_published = true AND auth.role() = 'authenticated');

-- Quiz Questions RLS: Teachers manage, students view questions from published quizzes
CREATE POLICY "Teachers manage questions" ON public.quiz_questions FOR ALL USING (public.is_teacher());
-- NOTE: Student SELECT policy specifically DROPPED to mitigate correct_answer exposure. 
-- ALL Student Assessment payloads MUST occur implicitly through Server Actions tracking strict Service Role sanitization pipelines.

-- Quiz Attempts RLS: Teachers view, student manages own
CREATE POLICY "Teachers view attempts" ON public.quiz_attempts FOR SELECT USING (public.is_teacher());
CREATE POLICY "Students manage own attempts" ON public.quiz_attempts FOR ALL USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Attendance RLS: Teachers manage, students view own
CREATE POLICY "Teachers manage attendance" ON public.attendance FOR ALL USING (public.is_teacher());
CREATE POLICY "Students view own attendance" ON public.attendance FOR SELECT USING (auth.uid() = student_id);

-- Grades RLS: Teachers manage, students view own
CREATE POLICY "Teachers manage grades" ON public.grades FOR ALL USING (public.is_teacher());
CREATE POLICY "Students view own grades" ON public.grades FOR SELECT USING (auth.uid() = student_id);

-- Badges RLS: Teachers manage globally, students view all
CREATE POLICY "Teachers manage badges" ON public.badges FOR ALL USING (public.is_teacher());
CREATE POLICY "Students view all badges" ON public.badges FOR SELECT USING (auth.role() = 'authenticated');

-- Student Badges: Teachers manage, students view own
CREATE POLICY "Teachers manage student badges" ON public.student_badges FOR ALL USING (public.is_teacher());
CREATE POLICY "Students view own badges" ON public.student_badges FOR SELECT USING (auth.uid() = student_id);

-- XP Transactions RLS: Teachers manage, students view own
CREATE POLICY "Teachers manage xp" ON public.xp_transactions FOR ALL USING (public.is_teacher());
CREATE POLICY "Students view own xp" ON public.xp_transactions FOR SELECT USING (auth.uid() = student_id);

-- TRIGGERS
-- 1. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Auto-update XP totals based on transactions
CREATE OR REPLACE FUNCTION public.update_student_xp()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET xp_total = xp_total + NEW.amount WHERE id = NEW.student_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET xp_total = xp_total - OLD.amount WHERE id = OLD.student_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.profiles SET xp_total = xp_total - OLD.amount + NEW.amount WHERE id = NEW.student_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_xp_transaction
  AFTER INSERT OR UPDATE OR DELETE ON public.xp_transactions
  FOR EACH ROW EXECUTE PROCEDURE public.update_student_xp();

-- INDEXES for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON public.class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_lessons_class ON public.lessons(class_id);
CREATE INDEX IF NOT EXISTS idx_progress_student ON public.lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_class ON public.quizzes(class_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON public.attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_class ON public.grades(class_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_student ON public.student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_student ON public.xp_transactions(student_id);

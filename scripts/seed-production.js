const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bkwgwvqzxtbtrdqbmxnq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY is required in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedProduction() {
  console.log("--- SEEDING PRODUCTION DATA ---");

  try {
    // 1. Create Teacher
    console.log("Configuring Teacher Node...");
    const { data: teacherUser, error: tError } = await supabase.auth.admin.createUser({
      email: 'teacher@cs-lms.edu',
      password: 'ProductionPassword2026!',
      email_confirm: true,
      user_metadata: { full_name: 'Dr. Arisara Computer' }
    });
    if (tError) throw tError;
    const teacherId = teacherUser.user.id;

    await supabase.from('profiles').update({ role: 'teacher' }).eq('id', teacherId);

    // 2. Create Class
    console.log("Initializing Class Cluster...");
    const { data: classData, error: cError } = await supabase.from('classes').insert({
      name: 'CS101: Introduction to Computing',
      description: 'Foundational concepts of hardware, software, and networking.',
      teacher_id: teacherId,
      class_code: 'CS101-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      academic_year: '2026',
      semester: 1
    }).select().single();
    if (cError) throw cError;
    const classId = classData.id;

    // 3. Create 5 Students
    console.log("Provisioning Student Nodes (5)...");
    const students = [
      { name: 'Alice Tech', email: 'alice@cs-lms.edu' },
      { name: 'Bob Byte', email: 'bob@cs-lms.edu' },
      { name: 'Charlie Code', email: 'charlie@cs-lms.edu' },
      { name: 'Dana Data', email: 'dana@cs-lms.edu' },
      { name: 'Evan Ethernet', email: 'evan@cs-lms.edu' }
    ];

    for (const s of students) {
      const { data: sUser, error: sError } = await supabase.auth.admin.createUser({
        email: s.email,
        password: 'StudentPassword2026!',
        email_confirm: true,
        user_metadata: { full_name: s.name }
      });
      if (sError) {
        console.warn(`Skipping student ${s.email}: ${sError.message}`);
        continue;
      }
      const sId = sUser.user.id;
      
      // Update profile and enroll
      await supabase.from('profiles').update({ student_id: 'ST-' + Math.floor(1000 + Math.random() * 9000) }).eq('id', sId);
      await supabase.from('class_enrollments').insert({ class_id: classId, student_id: sId });
    }

    // 4. Create 2 Lessons
    console.log("Deploying Curriculum Modules...");
    const { data: l1, error: l1Error } = await supabase.from('lessons').insert({
      class_id: classId,
      title: 'Module 01: Hardware Basics',
      description: 'Understanding CPUs, RAM, and storage architecture.',
      content: '<h1>Module 01</h1><p>Welcome to Hardware Basics...</p>',
      lesson_order: 1,
      is_published: true,
      time_estimated_minutes: 45
    }).select().single();
    if (l1Error) throw l1Error;

    await supabase.from('lessons').insert({
      class_id: classId,
      title: 'Module 02: Software Ecosystem',
      description: 'Operating systems, compilers, and interpreted languages.',
      content: '<h1>Module 02</h1><p>Diving into the software stack...</p>',
      lesson_order: 2,
      is_published: true,
      time_estimated_minutes: 60
    });

    // 5. Create 1 Quiz
    console.log("Calibrating Assessment Protocol...");
    const { data: q1, error: q1Error } = await supabase.from('quizzes').insert({
      class_id: classId,
      lesson_id: l1.id,
      title: 'Hardware Proficiency Test',
      time_limit_minutes: 20,
      max_attempts: 2,
      is_published: true,
      passing_score: 70
    }).select().single();
    if (q1Error) throw q1Error;

    await supabase.from('quiz_questions').insert([
      {
        quiz_id: q1.id,
        question: 'What is the primary function of the CPU?',
        question_type: 'multiple_choice',
        options: { a: 'Storage', b: 'Processing', c: 'Cooling', d: 'Display' },
        correct_answer: 'b',
        points: 5,
        order_num: 1
      },
      {
        quiz_id: q1.id,
        question: 'RAM is volatile memory. (True/False)',
        question_type: 'true_false',
        options: { true: 'True', false: 'False' },
        correct_answer: 'true',
        points: 5,
        order_num: 2
      }
    ]);

    console.log("--- SEEDING COMPLETE: SYSTEM READY ---");
  } catch (err) {
    console.error("FATAL ERROR DURING SEEDING:", err.message);
  }
}

seedProduction();

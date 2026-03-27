const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bkwgwvqzxtbtrdqbmxnq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrd2d3dnF6eHRidHJkcWJteG5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQyNzE1NCwiZXhwIjoyMDkwMDAzMTU0fQ.7NZOxmD6oJhOFIokJ2RGSb3sANK7i-9NbpNqti4Spzs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const firstNames = ["Somsak", "Somsree", "Somchai", "Somporn", "Aree", "Sunee", "Praphat", "Pranee", "Wichai", "Wimal", "Kanya", "Kitti", "Chai", "Charee", "Napa", "Narong", "Porn", "Prapha", "Mali", "Mala", "Udom", "Ubon", "Ratana", "Rachan", "Somkiat", "Somluck"];
const lastNames = ["Rakdee", "Suksamran", "Manirat", "Wongthong", "Jaidee", "Namchok", "Thongdee", "Boonsong", "Srichai", "Wongsa", "Sookjai", "Yimlamai", "Rakthai", "Chokdee", "Poomsuwan", "Kaewmanee", "Saisawang", "Rungsang", "Saengsawang", "Pornprom"];

async function seed() {
  console.log("Starting seeding of 50 students...");
  
  const classIds = ['6a80d64f-6caa-4893-bc87-0ca815638663', '376193e2-c620-4354-ba42-938e1890145c'];

  for (let i = 0; i < 50; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}${Math.floor(Math.random()*100)}@mock.school`;
    const studentId = "ST" + (10000 + Math.floor(Math.random() * 90000));

    console.log(`Creating student ${i+1}: ${fullName}`);

    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: email,
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (userError) {
      console.error(`Error creating user ${email}:`, userError.message);
      continue;
    }

    const userId = user.user.id;

    // Update profile with student_id
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ student_id: studentId })
      .eq('id', userId);

    if (profileError) {
      console.error(`Error updating profile for ${email}:`, profileError.message);
    }

    // Enroll in a random class
    const classId = classIds[i % 2];
    const { error: enrollError } = await supabase
      .from('class_enrollments')
      .insert({ class_id: classId, student_id: userId });

    if (enrollError) {
      console.error(`Error enrolling ${email}:`, enrollError.message);
    }
  }

  console.log("Seeding completed!");
}

seed();

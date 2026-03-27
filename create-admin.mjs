import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createAdmin() {
  console.log("Initializing Master Architect node...");
  
  // 1. Create or invite user via Admin API (bypasses RLS & normal signup routines)
  const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: 'admin@kinetic.net',
    password: 'CyberpunkPassword2026!',
    email_confirm: true,
    user_metadata: {
      full_name: 'Lead Architect',
      role: 'teacher'
    }
  });

  if (authError) {
    console.error("Failed to create master node:", authError.message);
    if (authError.message.includes('already registered')) {
        console.log("\nCredentials already exist! Please login using:");
        console.log("Email: admin@kinetic.net");
        console.log("Password: CyberpunkPassword2026!");
    }
    return;
  }

  // 2. Wait exactly 2 seconds for Postgres triggers to generate the profile row autonomously
  console.log("Waiting for database trigger replication...");
  await new Promise(r => setTimeout(r, 2000));
  
  // 3. Explicitly verify the profile elevation
  const { error: profileError } = await supabaseAdmin.from('profiles')
    .update({ 
      full_name: 'Lead Architect',
      role: 'teacher' 
    })
    .eq('id', data.user.id);

  if (profileError) {
    console.error("Profile Elevation Error:", profileError.message);
    console.log("Try dropping the Postgres trigger and modifying it manually if errors persist.");
  } else {
    console.log("\n===========================================");
    console.log("✅ SUCCESS! Master Teacher Template Generated.");
    console.log("===========================================");
    console.log("Email: admin@kinetic.net");
    console.log("Password: CyberpunkPassword2026!");
    console.log("Role: INSTRUCTOR/TEACHER");
    console.log("===========================================");
    console.log("You can now utilize these credentials to access the Teacher Dashboard!");
  }
}

createAdmin();

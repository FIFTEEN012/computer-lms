import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createStudent() {
  const email = "student@kinetic.net"
  const password = "password123"
  
  console.log(`Transmitting Student Creation Payload: ${email}...`)
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        console.log("Student user already exists. You can login with student@kinetic.net / password123")
        process.exit(0)
    }
    console.error("Error creating auth user:", authError.message)
    process.exit(1)
  }

  const user = authData.user

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    full_name: "Neon Student",
    role: "student",
    student_id: "NEON-001"
  })

  // Add initial mock XP to demonstrate the dashboard
  if (!profileError) {
      await supabase.from('profiles').update({ xp: 450, level: 3 }).eq('id', user.id)
  }

  if (profileError) {
    console.error("Error creating profile mapping:", profileError.message)
    process.exit(1)
  }

  console.log(`\n✅ STUDENT NODE ALLOCATED SUCCESSFULLY`)
  console.log(`=========================`)
  console.log(`Email:    ${email}`)
  console.log(`Password: ${password}`)
  console.log(`Role:     Student`)
  console.log(`=========================`)
  process.exit(0)
}

createStudent()

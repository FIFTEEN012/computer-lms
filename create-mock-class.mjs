import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { randomBytes } from 'crypto'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE credentials.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createMockClass() {
  console.log("Looking up admin@kinetic.net...")
  // Fetch teacher
  const { data: users, error: authError } = await supabase.auth.admin.listUsers()
  if (authError || !users) {
     console.error("Failed to fetch users", authError)
     return
  }

  const adminUser = users.users.find(u => u.email === 'admin@kinetic.net')
  if (!adminUser) {
     console.log("Teacher profile admin@kinetic.net not found. Run create-admin.mjs first.")
     return
  }

  const classCode = randomBytes(3).toString('hex').toUpperCase()

  const { data, error } = await supabase.from('classes').insert({
    name: 'CS50: APPLIED CYBERNETICS',
    description: 'Advanced payload delivery and neural network security methodologies.',
    class_code: classCode,
    teacher_id: adminUser.id,
    academic_year: '2077'
  }).select().single()

  if (error) {
     console.error("Failed creating class:", error.message)
     return
  }

  console.log(`✅ CLASS CREATED SUCCESSFULLY!`)
  console.log(`   Class Name: ${data.name}`)
  console.log(`   Class Code: ${data.class_code}`)
  console.log(`   URL Shortcut: http://localhost:3000/teacher/classes/${data.id}/lessons`)
}

createMockClass()

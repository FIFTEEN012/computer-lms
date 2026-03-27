import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) process.exit(1)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupLessonStorage() {
  const { data, error } = await supabase.storage.createBucket('lesson-images', {
    public: true,
    fileSizeLimit: 10485760, // 10MB limit
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  })
  
  if (error && !error.message.includes('already exists')) {
     console.error("Storage Instantiation Failed: ", error.message)
  } else {
     console.log("✅ LESSON-IMAGES BUCKET ALLOCATED LOCALLY")
  }
}

setupLessonStorage()

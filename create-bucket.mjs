import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  const { data, error } = await supabase.storage.createBucket('avatars', {
    public: true,
    fileSizeLimit: 5242880, // 5MB limit
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  })
  
  if (error && !error.message.includes('already exists')) {
     console.error("Storage Initialization Failure: ", error.message)
  } else {
     console.log("✅ AVATARS BUCKET ALLOCATED AND PUBLICLY EXPOSED")
  }
}

setupStorage()

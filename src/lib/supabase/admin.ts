import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Note: This client uses the service role key and bypasses RLS.
// It should ONLY be used in secure server environments (like Server Actions or API routes) 
// where you intentionally want to bypass Row Level Security.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()
  await supabase.auth.signOut()
  
  // Clear generic page cache safely routing back to auth gateway
  revalidatePath('/', 'layout')
  redirect('/login')
}

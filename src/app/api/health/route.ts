import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()
  
  try {
    // Check Supabase connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1).single()
    
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    if (error) throw error

    return NextResponse.json({
      status: 'OPERATIONAL',
      timestamp: new Date().toISOString(),
      database: 'CONNECTED',
      environment: envCheck,
      node: process.version
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'DEGRADED',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ CRITICAL: Missing Supabase credentials in .env.local")
  process.exit(1)
}

console.log(`\n🔍 DIAGNOSTIC START`)
console.log(`==========================================`)
console.log(`Target URL: ${supabaseUrl}`)
console.log(`Testing reachability...`)

async function testConnection() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    const start = Date.now()
    // Perform a simple fetch to the auth node
    const { data, error } = await supabase.auth.getSession()
    const duration = Date.now() - start

    if (error) {
       console.error(`\n❌ AUTH_FETCH_FAILED:`)
       console.error(`Message: ${error.message}`)
       console.error(`Status:  ${error.status}`)
       
       if (error.message.includes('fetch')) {
         console.log(`\n💡 SUGGESTION: This is a network error.`)
         console.log(`1. Check your internet connection.`)
         console.log(`2. Verify that '${supabaseUrl}' is reachable from your browser.`)
         console.log(`3. Check if a firewall or VPN is blocking the connection.`)
       }
    } else {
      console.log(`\n✅ CONNECTION_SUCCESSFUL`)
      console.log(`Latency: ${duration}ms`)
      console.log(`Payload: Session data retrieved (no active session expected)`)
    }

    // Try reading a public table
    console.log(`\n🔍 TESTING_DATABASE_ACCESS...`)
    const { error: dbError } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1)
    
    if (dbError) {
      console.warn(`⚠️  DATABASE_READ_WARNING: ${dbError.message}`)
      console.log(`(This might be normal if RLS policies are strict)`)
    } else {
      console.log(`✅ DATABASE_ACCESSIBLE`)
    }

  } catch (err) {
    console.error(`\n☢️  FATAL_ERROR:`)
    console.error(err)
  }
  
  console.log(`==========================================\n`)
}

testConnection()

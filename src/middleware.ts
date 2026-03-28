import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    console.error('[Middleware] User fetch error:', authError.message)
    // If it's a connection error (fetch failed), it could be Supabase is unreachable
    if (authError.message.includes('fetch')) {
      console.error('[Middleware] CRITICAL: Supabase unreachable from server.')
    }
  }

  const { pathname } = request.nextUrl

  // Define restricted routes
  const isDashboard = pathname.startsWith('/dashboard')
  const isTeacherRoute = pathname.startsWith('/teacher')
  const isStudentRoute = pathname.startsWith('/student')
  const isLoginRoute = pathname.startsWith('/login')
  const isProtected = isDashboard || isTeacherRoute || isStudentRoute

  // Redirect to login if accessing protected route without session
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Handles logic for authenticated users
  if (user) {
    // Redirect away from login page if already authenticated
    if (isLoginRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Role-based routing enforcement
    if (isProtected) {
      // Fetch user role from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        
      const role = profile?.role

      if (role === 'teacher') {
        // Teachers shouldn't access the student dashboard or root dashboard
        if (isStudentRoute || pathname === '/dashboard') {
          const url = request.nextUrl.clone()
          url.pathname = '/teacher/dashboard'
          return NextResponse.redirect(url)
        }
      } else if (role === 'student' || !role) {
        // Students shouldn't access the teacher dashboard or root dashboard
        if (isTeacherRoute || pathname === '/dashboard') {
          const url = request.nextUrl.clone()
          url.pathname = '/student/dashboard'
          return NextResponse.redirect(url)
        }
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

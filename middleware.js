import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // /backend koruması
  if (path.startsWith('/backend')) {
    const isLoginPage = path === '/backend/login'
    if (!user && !isLoginPage) return NextResponse.redirect(new URL('/backend/login', request.url))
    if (user && isLoginPage) return NextResponse.redirect(new URL('/backend', request.url))
  }

  // /atolye koruması
  if (path.startsWith('/atolye')) {
    const isLoginPage = path === '/atolye/login'
    if (!user && !isLoginPage) return NextResponse.redirect(new URL('/atolye/login', request.url))
    if (user && isLoginPage) return NextResponse.redirect(new URL('/atolye', request.url))
  }

  // /reseller koruması
  if (path.startsWith('/reseller')) {
    const isLoginPage = path === '/reseller/login'
    if (!user && !isLoginPage) return NextResponse.redirect(new URL('/reseller/login', request.url))
    if (user && isLoginPage) return NextResponse.redirect(new URL('/reseller', request.url))
  }

  // /verkauf koruması
  if (path.startsWith('/verkauf')) {
    const isLoginPage = path === '/verkauf/login'
    if (!user && !isLoginPage) return NextResponse.redirect(new URL('/verkauf/login', request.url))
    if (user && isLoginPage) return NextResponse.redirect(new URL('/verkauf', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/backend/:path*', '/atolye/:path*', '/verkauf/:path*', '/reseller/:path*'],
}

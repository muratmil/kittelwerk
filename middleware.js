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

  // Rol lazımsa profile tablosundan çek
  let role = null
  const needsRole = path.startsWith('/verkauf') || path.startsWith('/backend')
  if (user && needsRole) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = profile?.role ?? null
  }

  // /backend koruması — sadece admin
  if (path.startsWith('/backend')) {
    const isLoginPage = path === '/backend/login'
    if (!user && !isLoginPage) return NextResponse.redirect(new URL('/backend/login', request.url))
    if (user && isLoginPage && role === 'admin') return NextResponse.redirect(new URL('/backend', request.url))
    if (user && !isLoginPage && role !== 'admin') {
      return NextResponse.redirect(new URL('/backend/login', request.url))
    }
  }

  // /atolye koruması
  if (path.startsWith('/atolye')) {
    const isLoginPage = path === '/atolye/login'
    const isKayitPage = path === '/atolye/kayit'
    if (!user && !isLoginPage && !isKayitPage) return NextResponse.redirect(new URL('/atolye/login', request.url))
    if (user && isLoginPage) return NextResponse.redirect(new URL('/atolye', request.url))
  }

  // /reseller koruması
  if (path.startsWith('/reseller')) {
    const isLoginPage = path === '/reseller/login'
    const isRegisterPage = path === '/reseller/register'
    if (!user && !isLoginPage && !isRegisterPage) return NextResponse.redirect(new URL('/reseller/login', request.url))
    if (user && isLoginPage) return NextResponse.redirect(new URL('/reseller', request.url))
  }

  // /verkauf koruması — sadece verkauf ve admin
  if (path.startsWith('/verkauf')) {
    const isLoginPage = path === '/verkauf/login'
    if (!user && !isLoginPage) return NextResponse.redirect(new URL('/verkauf/login', request.url))
    if (user && isLoginPage && (role === 'verkauf' || role === 'admin')) return NextResponse.redirect(new URL('/verkauf', request.url))
    if (user && !isLoginPage && role !== 'verkauf' && role !== 'admin') {
      return NextResponse.redirect(new URL('/verkauf/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/backend/:path*', '/atolye/:path*', '/verkauf/:path*', '/reseller/:path*'],
}

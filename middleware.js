import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { AREAS, OPEN_PATHS, areaForPath, homeFor } from '@/lib/portal'

// Dört kopyala-yapıştır blok yerine tek kural: alan tablosu lib/portal.js'te.
// Not: burası yalnızca YÖNLENDİRME yapar. Gerçek sınır veritabanındaki RLS —
// buradaki bir hata en fazla yanlış sayfaya götürür, veri sızdırmaz.
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

  const path = request.nextUrl.pathname
  const { data: { user } } = await supabase.auth.getUser()

  const roleOf = async () => {
    if (!user) return null
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    return data?.role ?? null
  }

  // Giriş sayfası: oturum açıksa kendi alanına gönder
  if (path === '/login') {
    if (!user) return supabaseResponse
    const role = await roleOf()
    return NextResponse.redirect(new URL(homeFor(role), request.url))
  }

  // Kayıt sayfaları gibi, korunan alanın içinde ama herkese açık adresler
  if (OPEN_PATHS.includes(path)) return supabaseResponse

  const area = areaForPath(path)
  if (!area) return supabaseResponse

  if (!user) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  const role = await roleOf()
  if (!area.roles.includes(role)) {
    // Yetkisi yoksa kendi alanına; hiç rolü yoksa girişe.
    const target = role ? homeFor(role) : '/login'
    return NextResponse.redirect(new URL(target, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/login',
    '/admin/:path*',
    '/bestellung/:path*',
    '/werkstatt/:path*',
    '/haendler/:path*',
    '/konto/:path*',
  ],
}

import { NextResponse } from 'next/server';
import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config';

// Dil yönlendirmesi (2026-09-29).
//   /produkte      → içeride /de/produkte (adres çubuğu değişmez)
//   /de/produkte   → 308 → /produkte   (Almanca'nın tek adresi olsun)
//   /en/produkte   → olduğu gibi
// Otomatik dil yönlendirmesi YOK: Google Almanca sayfaları görmeye devam
// etmeli; dil seçimi ziyaretçinin elinde.
const DATEI = /\.[a-z0-9]+$/i; // /images/x.webp, /robots.txt, /sitemap.xml …

export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  if (DATEI.test(pathname)) return NextResponse.next();
  const ilk = pathname.split('/')[1];

  if (ilk === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || '/';
    return NextResponse.redirect(url, 308);
  }
  if (LOCALES.includes(ilk)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  // API ve Next iç dosyaları dil yönlendirmesinden geçmez. Uzantılı dosyalar
  // (görsel, robots.txt, sitemap.xml…) yukarıda `DATEI` ile ayıklanıyor —
  // eşleştiriciye `\.` yazmak işe yaramadı: Next kaçışı düşürüp noktayı
  // "herhangi karakter" yapıyor ve proxy HİÇBİR adreste çalışmıyordu.
  matcher: ['/((?!api|_next).*)'],
};

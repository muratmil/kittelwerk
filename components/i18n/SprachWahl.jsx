'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { LOCALES, SPRACHEN, pfad, ohneSprache } from '@/lib/i18n/config';
import { useSprache } from '@/components/i18n/SpracheProvider';

/**
 * Dil seçici (2026-09-29). Aynı sayfanın diğer dildeki adresine gider:
 * /produkte/tshirt → /en/produkte/tshirt. Bağlantı düz <a>: dil değişince
 * kök düzen (html lang) de değişiyor, tam sayfa yüklemesi doğru olan.
 */
export default function SprachWahl() {
  const { lang, t } = useSprache();
  const pathname = usePathname() ?? '/';
  const [offen, setOffen] = useState(false);
  const kutu = useRef(null);

  useEffect(() => {
    if (!offen) return undefined;
    const disari = (e) => { if (!kutu.current?.contains(e.target)) setOffen(false); };
    const tus = (e) => e.key === 'Escape' && setOffen(false);
    document.addEventListener('mousedown', disari);
    window.addEventListener('keydown', tus);
    return () => { document.removeEventListener('mousedown', disari); window.removeEventListener('keydown', tus); };
  }, [offen]);

  const rest = ohneSprache(pathname);

  return (
    <div ref={kutu} className="relative">
      <button type="button" onClick={() => setOffen((o) => !o)}
        aria-haspopup="listbox" aria-expanded={offen} aria-label={t.nav.sprache}
        className="flex items-center gap-1.5 border-2 border-ink bg-paper px-2 sm:px-2.5 py-2.5 font-black text-xs uppercase hover:bg-sun transition-colors">
        <Globe size={16} aria-hidden="true" className="hidden sm:block" />
        {SPRACHEN[lang]?.kurz ?? lang.toUpperCase()}
      </button>
      {offen && (
        <ul role="listbox" aria-label={t.nav.sprache}
          className="absolute right-0 top-full mt-2 min-w-[150px] bg-paper border-4 border-ink shadow-brutalist z-[60]">
          {LOCALES.map((l) => (
            <li key={l} role="option" aria-selected={l === lang}>
              <a href={pfad(l, rest)} hrefLang={l} lang={l}
                className={`flex items-center justify-between gap-3 px-4 py-3 text-sm font-bold border-b border-ink/10 last:border-b-0 hover:bg-sun
                  ${l === lang ? 'text-tomato' : 'text-ink'}`}>
                {SPRACHEN[l].name}
                <span className="text-[10px] font-black opacity-50">{SPRACHEN[l].kurz}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

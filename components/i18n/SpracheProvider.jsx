'use client';

import { createContext, useContext, useMemo } from 'react';
import { woerterbuch, fuell } from '@/lib/i18n';
import { pfad } from '@/lib/i18n/config';

// Dil bağlamı: istemci bileşenleri `useSprache()` ile dili, sözlüğü ve
// adres yardımcısını alıyor. Sağlayıcı `app/[lang]/layout.js`'te.
const SpracheContext = createContext({ lang: 'de' });

export function SpracheProvider({ lang, children }) {
  return <SpracheContext.Provider value={{ lang }}>{children}</SpracheContext.Provider>;
}

export function useSprache() {
  const { lang } = useContext(SpracheContext);
  return useMemo(() => ({
    lang,
    t: woerterbuch(lang),
    p: (href) => pfad(lang, href),
    f: fuell,
    // Renk adları veride Almanca (anahtar); ekranda çevirisi.
    farbe: (name) => woerterbuch(lang).farben?.[name] ?? name,
  }), [lang]);
}
